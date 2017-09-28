/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import { DispatchContext } from 'components/dispatchContextProvider';
import { xFetch } from 'utils';
import { TypeColors } from 'constants/colors';
import { ThreeScene } from 'components/graph/threeScene';
import * as viewActions from 'actions/views';
import { GraphItem } from 'components/graph/graphItem';
import { QueryServerResult } from 'api/query';
import { Cluster } from 'components/graph/cluster';


require('./graph.scss');

export interface Props {
  result: QueryServerResult;
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

  static contextTypes = {
    dispatch: React.PropTypes.func.isRequired,
  };
  context: DispatchContext;

  constructor(props: Props) {
    super(props);

    this.handleCanvasClick = this.handleCanvasClick.bind(this);
  }

  componentDidMount() {
    super.componentDidMount();
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

  public clearScene() {
    // clear scene
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

    const items = result.data;

    result.clusters.forEach((clusterItems, i) => {
      if (clusterItems.length === 1) {
        const item = new GraphItem(clusterItems[0]);
        this.items.push(item);
  
        // create obj to render
        const sceneObj = item.getSceneObj();
        this.intersectionMeshes.push(sceneObj.children[0]);
        this.scene.add(sceneObj);
      } else {
        const name = 'cluster_' + i;
        const cluster = new Cluster(name, clusterItems);
        this.clusters.set(name, cluster);
        const sceneObj = cluster.getSceneObj();
        this.intersectionMeshes.push(sceneObj.children[0]);        
        this.scene.add(sceneObj);
      }

    });

    const realBoundingBox = result.boundingBox;
    this.zoomToFit(realBoundingBox);
  }
  
  /** @inheritDoc */
  protected onAnimate() {
    // calculate intersections with scene items
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.intersectionMeshes);

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
   * Handles click on canvas: if item is hovered, details are shown.
   */
  protected handleCanvasClick(event: React.MouseEvent<HTMLElement>) {
    // close cluster if one is active
    // TODO: change...
    if (this.activeCluster) {
      this.deactivateCluster();
      return;
    }

    if (this.intersectionId) {
      DEBUG && console.log('detailGraph: click on ', this.intersectionId);

      if (this.intersectionId.startsWith('cluster_')) {
        this.setClusterActive(this.clusters.get(this.intersectionId));
      } else {
        // resolve item by id
        const item = this.props.result.data.find(item => (item.id === this.intersectionId));
        this.context.dispatch(
          viewActions.openItemDetail(item)
        );
      }

    }
  }

  private setClusterActive(nextCluster: Cluster) {
    if (this.activeCluster) {
      this.activeCluster.collapse();
    }

    nextCluster.expand();
    this.activeCluster = nextCluster;

    // hide all elements
    this.items.forEach(item => item.setOpacity(0));
    this.clusters.forEach(cluster => {
      if (cluster !== nextCluster) {
        cluster.setOpacity(0);
      } else {
        cluster.setOpacity(1);
      }
    });
  }

  private deactivateCluster() {
    if (this.activeCluster) {
      this.activeCluster.collapse();
    }
    this.activeCluster = null;

    // show all elements
    this.items.forEach(item => item.setOpacity(1));
    this.clusters.forEach(cluster => cluster.setOpacity(1));
  }
}
