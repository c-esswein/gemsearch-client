/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import { DispatchContext } from 'components/dispatchContextProvider';
import { xFetch } from 'utils';
import { TypeColors } from 'constants/colors';
import { ThreeScene } from 'components/graph/threeScene';
import * as viewActions from 'actions/views';


require('./graph.scss');

export interface Props {
  items: DataItem[];
}

/**
 * Three.js Graph visualization.
 */
export class DetailGraph extends ThreeScene<Props> {

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
    if (this.meshItems) {
      this.meshItems.forEach(child => {
        this.scene.remove(child);
      });
    }
    this.meshItems = [];

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    items.forEach(item => {

      // find smallest image
      const imageVersion = item.meta.images.length > 0 ? 
        (item.meta.images.find(image => image.width === 160) || item.meta.images[0])
        : {url: ''};
      const itemColor = TypeColors[item.type] || 0xFFFFFF;
      console.log(TypeColors, item.type, itemColor);
      const material = new THREE.PointsMaterial({
        color: itemColor,
        size: 20,
        // TODO: reenable item image + make sure color is shown despite image
        // map: loader.load(imageVersion.url),
      });

      const geometry = new THREE.Geometry();
      const pos = new THREE.Vector3();
      pos.fromArray(item.position);
      geometry.vertices.push(pos);
      
      const scalingFac = 300;
      const mesh = new THREE.Points(geometry, material);
      mesh.position.fromArray(item.position);
      mesh.position.multiplyScalar(scalingFac);
      mesh.name = item.id;

      this.meshItems.push(mesh);
      this.scene.add(mesh);
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
