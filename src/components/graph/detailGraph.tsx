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


require('./graph.scss');

export interface Props {
  items: DataItem[];
}


/**
 * Three.js Graph visualization.
 */
export class DetailGraph extends ThreeScene<Props> {

  private items: GraphItem[];
  private meshItems: THREE.Object3D[];
  private raycaster: THREE.Raycaster;
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
    if (nextProps.items !== this.props.items) {
      this.renderItems(nextProps.items);  
    }
  }

  /** @inheritDoc */
  protected onThreeSceneCreated() {
    this.raycaster = new THREE.Raycaster();

    this.renderItems(this.props.items);
    this.startAnimating();    
  }

  /**
   * Renders given items as 3D objects on scene.
   */
  private renderItems(items: DataItem[]) {
    // clear scene
    this.scene.children.forEach(child => {
      this.scene.remove(child);
    });
    this.meshItems = [];
    this.items = [];

    items.forEach(dataItem => {
      const item = new GraphItem(dataItem);
      this.items.push(item);

      // create obj to render
      const sceneObj = item.getSceneObj();
      this.meshItems.push(sceneObj.children[0]);
      this.scene.add(sceneObj);
    });

  }
  
  /** @inheritDoc */
  protected onAnimate() {
    // calculate intersections with scene items
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.meshItems);

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
    if (this.intersectionId) {
      // resolve item by id
      const item = this.props.items.find(item => (item.id === this.intersectionId));

      this.context.dispatch(
        viewActions.openItemDetail(item)
      );
    }
  }
}
