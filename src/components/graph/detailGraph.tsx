/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { DataItem, ItemType, StoreState } from 'types';
import { DispatchContext } from 'components/dispatchContextProvider';
import { xFetch } from 'utils';
import { TypeColors } from 'constants/colors';
import { ThreeScene } from 'components/graph/threeScene';
import { State as ThreeSceneState } from 'components/graph/threeScene';
import * as viewActions from 'actions/views';
import { GraphItem } from 'components/graph/graphItem';
import { QueryServerResult, queryForItemsForGraph, queryGraphItemsAround } from 'api/query';
import { Cluster } from 'components/graph/cluster';
import { RemoveIcon } from 'icons';
import { ApiThrottle } from 'utils/apiThrottle';
import { CancelablePromise } from 'utils/cancelablePromise';
import { DbUser } from 'api/user';
import * as deepEqual from 'deep-equal';
import { isUserEmbedded } from 'reducers/user';
import { LAYOUT_CONFIG } from 'components/graph';

require('./graph.scss');

interface Props {
  queryItems: DataItem[];
  typeFilter: string[];
  useUserAsContext: boolean;
  user: DbUser;
}

interface State {
  isLoading: boolean;
  activeClusterId: string | null;
  intersectionId: string | null;
  intersectionPoint: THREE.Vector3 | null;
  result: QueryServerResult | null;  
}

const DEBUG = true;
const ITEMS_PER_REQUEST = 100;

/**
 * Three.js Graph visualization.
 */
export class DetailGraph extends ThreeScene<Props, State & ThreeSceneState> {

  private items: GraphItem[];
  private clusters: Map<string, Cluster>;
  private clusterCounter: number;
  private activeCluster: Cluster;
  private raycaster: THREE.Raycaster;
  private intersectionMeshes: THREE.Object3D[];
  private throttleApi = new ApiThrottle<QueryServerResult>();
  private queryPromise: CancelablePromise<QueryServerResult>;

  /** Mouse position before cluster was expanded */
  private cameraPosBeforeCluster: THREE.Vector3;

  /** scale fac for positions if a cluster is active */
  private clusterScale = 2;

  private page = -1;

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.state = {
      showPointerCursor: false,
      isLoading: false,
      activeClusterId: null,
      intersectionId: null,
      intersectionPoint: null,
      result: null,
    };

    this.handleCanvasClick = this.handleCanvasClick.bind(this);
    this.handleInitialItemsLoaded = this.handleInitialItemsLoaded.bind(this);
    this.renderItems = this.renderItems.bind(this);
  }

  componentWillMount(): void {
    // query for initial items
    const { queryItems, typeFilter, user, useUserAsContext } = this.props;
    this.queryForItems(queryItems, typeFilter, user, useUserAsContext);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems ||
      !deepEqual(nextProps.user, this.props.user) ||
      nextProps.useUserAsContext !== this.props.useUserAsContext ||
      nextProps.typeFilter !== this.props.typeFilter) {
        // query from query bar has changed
        this.page = -1;
        this.queryForItems(nextProps.queryItems, nextProps.typeFilter, nextProps.user, nextProps.useUserAsContext);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    this.throttleApi.dispose();
    if (this.queryPromise) {
      this.queryPromise.cancel();
      this.queryPromise = null;
    }
  }


  /** @inheritDoc */
  protected onThreeSceneCreated() {
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Query api for items.
   */
  private queryForItems(queryItems: DataItem[], typeFilter: string[], user: DbUser, useUserAsContext: boolean) {
    this.page++;
    const offset = ITEMS_PER_REQUEST * this.page;

    this.setState({
      isLoading: true,
    });

    // cancel previous request
    if (this.queryPromise) {
      this.queryPromise.cancel();
    }

    let queryUser: DbUser = null;
    if (useUserAsContext && isUserEmbedded(user)) {
      queryUser = user;
    }

    this.queryPromise = new CancelablePromise(queryForItemsForGraph(queryItems, typeFilter, ITEMS_PER_REQUEST, offset, queryUser));
    this.queryPromise.then(this.handleInitialItemsLoaded);
  }

  /**
   * Queries for more items around vec.
   */
  private loadMoreItems(vec: THREE.Vector3) {
    const { typeFilter, user, useUserAsContext} = this.props;
    const offset = 0;

    let queryUser: DbUser = null;
    if (useUserAsContext && isUserEmbedded(user)) {
      queryUser = user;
    }

    this.throttleApi.fetch(() => {
      return queryGraphItemsAround(vec.toArray(), typeFilter, ITEMS_PER_REQUEST, offset, queryUser);
    }, this.renderItems);
  }

  /**
   * Handles api response for first query items.
   * Result is rendered and camera centered to fit result.
   */
  private handleInitialItemsLoaded(data: QueryServerResult) {
    this.setState({
      isLoading: false,
      result: data,
    });

    this.clearScene();
    this.renderItems(data);

    // center on results
    const realBoundingBox = data.boundingBox;
    const center = new THREE.Vector3().fromArray(data.clusters[0].center);
    this.zoomToFit(realBoundingBox, center);
  }


  /**
   * Clears all elements of current scene.
   */
  public clearScene() {
    while(this.scene.children.length) {
      this.scene.remove(this.scene.children.pop());
    }
    this.intersectionMeshes = [];
    this.items = [];
    this.clusters = new Map();
    this.activeCluster = null;
    this.clusterCounter = 0;
  }

  /**
   * Renders given items as 3D objects on scene.
   */
  private renderItems(result: QueryServerResult) {
    DEBUG && console.log('detailGraph: render items', result);
    if (!result || !result.clusters) {
      DEBUG && console.error('detailGraph: Empty server response', result);
      return;
    }

    // do not render additional items when in cluster mode, would be nice, but positions and states
    // would have to be set --> could be improved!
    if (this.activeCluster) {
      return;
    }

    // render clusters / elements for clusters with single item
    result.clusters.forEach((clusterData, i) => {
      // remove already rendered items:
      clusterData.items = clusterData.items.filter(item => this.getItemById(item.id, true) === null);

      if (clusterData.items.length === 1) {
        const item = new GraphItem(clusterData.items[0]);
        this.items.push(item);
  
        // create obj to render
        const {sceneObj, intersectionMesh} = item.getSceneObj();
        this.intersectionMeshes.push(intersectionMesh);
        this.scene.add(sceneObj);
      } else if (clusterData.items.length > 1) {
        const name = 'cluster_' + (this.clusterCounter++);
        const cluster = new Cluster(name, clusterData);
        this.clusters.set(name, cluster);
        const {sceneObj, intersectionMesh} = cluster.getSceneObj();
        this.intersectionMeshes.push(intersectionMesh);
        this.scene.add(sceneObj);
      }

    });

    this.startAnimating();    
  }
  
  /** @inheritDoc */
  protected onAnimate() {
    this.checkIntersections();
  }

  /**
   * Calculate intersections with scene items.
   */
  private checkIntersections() {    
    let intersectionMeshes = this.intersectionMeshes;

    if (this.activeCluster) {
      intersectionMeshes = this.activeCluster.intersectionMeshes;
    }
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(intersectionMeshes);

    let intersectionId = null;
    if (intersects.length > 0) {
      // save intersection and show pointer
      const intersectIndex = intersects[0].index;
      intersectionId = intersects[0].object.name;
      this.setPointerCursor(true);
    } else {
      // no intersection
      this.setPointerCursor(false);
    }

    // new intersection
    if (intersectionId !== this.state.intersectionId) {
      if (intersectionId) {
        const intersectionPoint = intersects[0].point.clone();
        this.setState({intersectionId, intersectionPoint});
      } else {
        this.setState({intersectionId, intersectionPoint: null});        
      }
    }

  }

  /** @inheritDoc */
  protected handleControlUpdate() {
    super.handleControlUpdate();

    // rotate scene elements to always face camera
    const cameraPos = this.camera.position;

    this.items.forEach(graphItem => graphItem.lookAt(cameraPos));
    this.clusters.forEach(clusters => clusters.lookAt(cameraPos));
  }

  /** @inheritDoc */
  protected onCameraUpdate() {
    super.onCameraUpdate();

    // do not load more items if in cluster mode
    if (this.activeCluster) {
      return;
    }

    // get camera center and load more items there
    const centerPos = this.getCameraLookAt();
    centerPos.multiplyScalar(1 / LAYOUT_CONFIG.scalingFac);
    console.log(centerPos);
    this.loadMoreItems(centerPos);
  }


  /**
   * Handles click on canvas: if item is hovered, details are shown / cluster is expanded.
   */
  protected handleCanvasClick(event: React.MouseEvent<HTMLElement>) {
    const {intersectionId} = this.state;
    if (!intersectionId) {
      return ;
    }

    DEBUG && console.log('detailGraph: click on ', intersectionId);

    if (intersectionId.startsWith('cluster_')) {
      // click on cluster
      this.setClusterActive(this.clusters.get(intersectionId));
    } else {
      // resolve item by id
      const item = this.getItemById(intersectionId);
      this.context.dispatch(
        viewActions.openItemDetail(item)
      );
    }

  }

  /**
   * Returns item info by id.
   */
  private getItemById(id: string, inAllClusters = false): DataItem {

    if (!inAllClusters && this.activeCluster !== null) {
      // in cluster mode
      return this.activeCluster.model.items.find(item => item.id === id);
    }

    // find in items:
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].model.id === id) {
        return this.items[i].model;
      }
    }

    if (inAllClusters) {
      // check if item is in cluster
      let found: DataItem = null;
      this.clusters.forEach((cluster) => {
        for (let i = 0; i < cluster.model.items.length; i++) {
          if (cluster.model.items[i].id === id) {
            found = cluster.model.items[i];
            break;
          }
        }
      });
      return found;
    }

    return null;
  }


  /**
   * Set given cluster active. Collapses other active cluster.
   */
  private setClusterActive(nextCluster: Cluster) {
    if (this.activeCluster && nextCluster.name === this.activeCluster.name) {
      // cluster is already active
      return;
    }

    if (this.activeCluster) {
      this.activeCluster.collapse();
      console.warn('Only one cluster can be open at a time, closing previous cluster');
    }

    nextCluster.expand();
    this.activeCluster = nextCluster;
    // make sure all elements are rotated correctly
    this.clusters.forEach(clusters => clusters.lookAt(this.camera.position));    

    // hide all elements and scale positions
    this.items.forEach(item => {
      item.setOpacity(0.2);
      item.scalePosition(this.clusterScale);
    });
    this.clusters.forEach(cluster => {
      if (cluster !== nextCluster) {
        cluster.setOpacity(0.2);
      }
      cluster.scalePosition(this.clusterScale);
    });

    this.setState({activeClusterId: nextCluster.name});

    // save current mouse position and center cluster
    this.cameraPosBeforeCluster = this.camera.position.clone();
    // this.zoomToFit(nextCluster.getBoundingBox(), nextCluster.getCenter());
  }

  /**
   * Deactivates current cluster.
   */
  private deactivateCluster() {
    if (this.activeCluster) {
      this.activeCluster.collapse();
    }
    this.activeCluster = null;

    // show all elements
    this.items.forEach(item => {
      item.setOpacity(1);
      item.scalePosition(1/this.clusterScale);
    });
    this.clusters.forEach(cluster => {
      cluster.setOpacity(1);
      cluster.scalePosition(1/this.clusterScale);
    });

    this.setState({activeClusterId: null});
    

    // restore camera
    // this.camera.position.copy(this.cameraPosBeforeCluster);
  }

  /** @inheritDoc */
  protected renderChildElements() {
    const {intersectionId, intersectionPoint, activeClusterId} = this.state;
    const isClusterActive = !!activeClusterId;

    let itemHover = null;    
    const hoverStyles: React.CSSProperties = {};
    try {
      if (intersectionPoint) {
        const realWorld = this.getElementCoordinates(intersectionPoint);
        hoverStyles.left = realWorld.x;
        hoverStyles.top = realWorld.y;
      }

      if (intersectionId && intersectionId.startsWith('cluster_')) {
        const cluster = this.clusters.get(intersectionId);
        itemHover = (
          <div>Cluster with {cluster.model.items.length} items.</div>
        );
      } else if (intersectionId) {
        const item = this.getItemById(intersectionId);
        if (!item) {
          console.error('Precondition violation: Intersection item not found');
        } else {
          itemHover = (
            <div>
              <div className="detailGraph__item-hover-name">{item.name}</div>
              {item.meta && item.meta.artist ?
                <div className="detailGraph__item-hover-artist">{item.meta.artist}</div>
              : null}
            </div>
          );
        }
      }
    } catch (ex) {
      console.error('Wrong intersection info', ex);
    }

    return (
      <div>
        {/* Cluster close btn */}
        <div className={'detailGraph__cluster-close ' + (isClusterActive ? 'active' : '')}
        onClick={() => this.deactivateCluster()} title="close cluster">
          <RemoveIcon className="svg-fill-current" />
        </div>

        {/* Item hover */}        
        <div className={'detailGraph__item-hover ' + (intersectionId ? 'active' : '')} style={hoverStyles}>
          {itemHover}
        </div>
      </div>
    );
  }
}
