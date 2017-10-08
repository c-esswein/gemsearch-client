/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { DataItem, ItemType, StoreState } from 'types';
import { DispatchContext } from 'components/dispatchContextProvider';
import { xFetch } from 'utils';
import { TypeColors } from 'constants/colors';
import { ThreeScene } from 'components/graph/threeScene';
import * as viewActions from 'actions/views';
import { GraphItem } from 'components/graph/graphItem';
import { QueryServerResult } from 'api/query';
import { Cluster } from 'components/graph/cluster';
import { setGraphClusterActive } from 'actions/views';
import { connect } from 'react-redux';
import { RemoveIcon } from 'icons';

require('./graph.scss');

export interface Props {
  result: QueryServerResult;
  activeClusterId: string | null;
}

const DEBUG = true;

/**
 * Three.js Graph visualization.
 */
export class DetailGraph extends ThreeScene<Props> {

  private items: GraphItem[];
  private clusters: Map<string, Cluster>;
  private activeCluster: Cluster;
  private raycaster: THREE.Raycaster;
  private intersectionMeshes: THREE.Object3D[];
  private intersectionId: string; 

  /** Mouse position before cluster was expanded */
  private cameraPosBeforeCluster: THREE.Vector3;

  /** scale fac for positions if a cluster is active */
  private clusterScale = 2;

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleCanvasClick = this.handleCanvasClick.bind(this);
  }

  componentWillMount() {
    // reset previous possible cluster
    this.context.dispatch(setGraphClusterActive(null));    
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.result !== this.props.result) {
      this.renderItems(nextProps.result);  
    }
  }

  /** @inheritDoc */
  protected onThreeSceneCreated() {
    this.raycaster = new THREE.Raycaster();

    this.renderItems(this.props.result);
    this.startAnimating();    
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

    if (!result) {
      return;
    }

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

    if (intersects.length > 0) {
      // save intersection and show pointer
      const intersectIndex = intersects[0].index;
      this.intersectionId = intersects[0].object.name;
      this.setPointerCursor(true);
    } else {
      // no intersection
      this.intersectionId = null;
      this.setPointerCursor(false);
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
    if (!this.intersectionId) {
      return ;
    }

    DEBUG && console.log('detailGraph: click on ', this.intersectionId);

    // click on cluster
    if (this.intersectionId.startsWith('cluster_')) {
      this.setClusterActive(this.clusters.get(this.intersectionId));
    }

    let items = this.props.result.data;
    if (this.activeCluster !== null) {
      // in cluster mode
      items = this.activeCluster.items;
    }

    // resolve item by id
    const item = items.find(item => (item.id === this.intersectionId));
    this.context.dispatch(
      viewActions.openItemDetail(item)
    );
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

    this.context.dispatch(setGraphClusterActive(nextCluster.name));

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

    this.context.dispatch(setGraphClusterActive(null));

    // restore camera
    // this.camera.position.copy(this.cameraPosBeforeCluster);
  }

  /** @inheritDoc */
  protected renderChildElements() {
    const isClusterActive = !!this.props.activeClusterId;

    return (
      <div className={'detailGraph__cluster-close ' + (isClusterActive ? 'active' : '')}
       onClick={() => this.deactivateCluster()} title="close cluster">
        <RemoveIcon className="svg-fill-current" />
      </div>
    );
  }
}

export interface ConnectedProps {
  
}

export const ConnectedDetailGraph = connect(
  ({ query, views }: StoreState, ownProps: ConnectedProps) => ({
    result: query.result,
    activeClusterId: views.graph.activeCluster,
  }),
)(DetailGraph as any);
  
  // TODO: fix typings
  

