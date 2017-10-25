
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import { TypeColors } from 'constants/colors';
import { LAYOUT_CONFIG } from 'components/graph';
import {TweenLite} from 'gsap';


export class GraphItem {

  public model: DataItem;
  private itemGroup: THREE.Group;

  constructor(model: DataItem) {
      this.model = model;
  }

  /**
   * Returns THREE render object group.
   */
  public getSceneObj() {
    if (!this.itemGroup) {
      this.render();
    }

    return {
      sceneObj: this.itemGroup, 
      intersectionMesh: this.itemGroup.children[0]
    };
  }

  private render() {
    const model = this.model;
    
    // create group to hold all item elements
    const itemGroup = new THREE.Group();
    itemGroup.position.fromArray(model.position);
    itemGroup.position.multiplyScalar(LAYOUT_CONFIG.scalingFac);
    
    // ---- create background circle element ----
    const bgGeometry = new THREE.CircleGeometry(5.2, LAYOUT_CONFIG.itemRadiusSegments);
    const itemColor = TypeColors[model.type] || 0xFFFFFF;      
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: itemColor,
      transparent: true,
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.name = model.id; // set name to identify object when using the raycaster
    bgMesh.position.z = -0.01;
    itemGroup.add(bgMesh);

    // ---- create image element ----
    // find smallest image
    // TODO: tags do not have images...
    const imageVersion = model.meta && model.meta.images.length > 0 ? 
      (model.meta.images.find(image => image.width === 160) || model.meta.images[0])
      : {url: ''};


    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const imgMaterial = new THREE.MeshBasicMaterial({
      // color: itemColor,
      // TODO: show color while image is loading
      map: loader.load(imageVersion.url),
      transparent: true,
    });

    const imgGeometry = new THREE.CircleGeometry(5, LAYOUT_CONFIG.itemRadiusSegments);
    itemGroup.add(new THREE.Mesh(imgGeometry, imgMaterial));

    this.itemGroup = itemGroup;            
  }

  /**
   * Set Opacity of cluster preview element. (is animated)
   */
  public setOpacity(opacity: number) {
    this.itemGroup.children.forEach(obj => {
      const mesh = obj as THREE.Mesh;
      const tween = TweenLite.to(mesh.material, 0.3, {opacity, onUpdate: () => {
        mesh.material.needsUpdate = true;
      }});

    });
  }

  public setHighlighted(isHighlighted: boolean) {
    if (isHighlighted) {
      this.itemGroup.scale.setScalar(1.2);
    } else {
      this.itemGroup.scale.setScalar(1);
    }
  }


  /**
   * Scales position vec by scaleFac.
   */
  public scalePosition(scaleFac: number, duration: number = 0.4) {
    const newPosition = this.itemGroup.position.clone().multiplyScalar(scaleFac);
    TweenLite.to(this.itemGroup.position, duration, 
      {x: newPosition.x, y: newPosition.y, z: newPosition.y, onUpdate: () => {        
      // this.itemGroup.nee
    }});
  }

  public lookAt(pos: THREE.Vector3) {
    this.itemGroup.lookAt(pos);
  }
}
