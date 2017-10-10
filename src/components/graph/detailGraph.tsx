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
import { QueryServerResult, queryForItemsForGraph } from 'api/query';
import { Cluster } from 'components/graph/cluster';
import { RemoveIcon } from 'icons';

require('./graph.scss');

interface Props {
  queryItems: DataItem[];
  typeFilter: string[];
}

interface State {
  isLoading: boolean;
  activeClusterId: string | null;
  intersectionId: string | null;
  intersectionPoint: THREE.Vector3 | null;
  result: QueryServerResult | null;  
}

const DEBUG = true;
const ITEMS_PER_REQUEST = 30;

/**
 * Three.js Graph visualization.
 */
export class DetailGraph extends ThreeScene<Props, State & ThreeSceneState> {

  private items: GraphItem[];
  private clusters: Map<string, Cluster>;
  private activeCluster: Cluster;
  private raycaster: THREE.Raycaster;
  private intersectionMeshes: THREE.Object3D[];

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
    this.handleItemsLoaded = this.handleItemsLoaded.bind(this);
  }

  componentWillMount(): void {
    // query for initial items
    this.queryForItems(this.props.queryItems, this.props.typeFilter);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.queryItems !== this.props.queryItems ||
      nextProps.typeFilter !== this.props.typeFilter) {
        // query from query bar has changed
        this.page = -1;
        this.queryForItems(nextProps.queryItems, nextProps.typeFilter);
    }
  }

  /**
   * Query api for items.
   */
  private queryForItems(queryItems: DataItem[], typeFilter: string[]) {
    this.page++;
    const offset = ITEMS_PER_REQUEST * this.page;

    this.setState({
      isLoading: true,
    });

    queryForItemsForGraph(queryItems, typeFilter, ITEMS_PER_REQUEST, offset)
      .then(this.handleItemsLoaded);
  }

  private handleItemsLoaded(data: QueryServerResult) {
    this.setState({
      isLoading: false,
      result: data,
    });

    this.renderItems(data);    
  }

  /** @inheritDoc */
  protected onThreeSceneCreated() {
    this.raycaster = new THREE.Raycaster();

    if (this.state.result) {
      this.renderItems(this.state.result);
      this.startAnimating();
    }
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
  }

  /**
   * Renders given items as 3D objects on scene.
   */
  private renderItems(result: QueryServerResult) {
    this.clearScene();

    if (!result || !result.clusters) {
      return;
    }

    DEBUG && console.log('detailGraph: render items', result);

    // render clusters / elements for clusters with single item
    result.clusters.forEach((clusterItems, i) => {
      if (clusterItems.length === 1) {
        const item = new GraphItem(clusterItems[0]);
        this.items.push(item);
  
        // create obj to render
        const {sceneObj, intersectionMesh} = item.getSceneObj();
        this.intersectionMeshes.push(intersectionMesh);
        this.scene.add(sceneObj);
      } else {
        const name = 'cluster_' + i;
        const cluster = new Cluster(name, clusterItems);
        this.clusters.set(name, cluster);
        const {sceneObj, intersectionMesh} = cluster.getSceneObj();
        this.intersectionMeshes.push(intersectionMesh);
        this.scene.add(sceneObj);
      }

    });

    const realBoundingBox = result.boundingBox;
    const center = new THREE.Vector3().fromArray(result.clusters[0][0].position);
    this.zoomToFit(realBoundingBox, center);

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
    this.scene.children.forEach((mesh) => mesh.lookAt(cameraPos));
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
  private getItemById(id: string): DataItem {

    if (this.activeCluster !== null) {
      // in cluster mode
      return this.activeCluster.items.find(item => item.id === id);
    }

    // find in items:
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].model.id === id) {
        return this.items[i].model;
      }
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
          <div>Cluster with {cluster.items.length} items.</div>
        );
      } else if (intersectionId) {
        const item = this.getItemById(intersectionId);
        if (!item) {
          console.error('Precondition violation: Intersection item not found');
        }
        itemHover = (
          <div>
            <div className="detailGraph__item-hover-name">{item.name}</div>
            {item.meta && item.meta.artist ?
              <div className="detailGraph__item-hover-artist">{item.meta.artist}</div>
            : null}
          </div>
        );
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
