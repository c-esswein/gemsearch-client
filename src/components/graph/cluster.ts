
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import { TypeColors } from 'constants/colors';
import { LAYOUT_CONFIG } from 'components/graph';
import { GraphItem } from 'components/graph/graphItem';
import { TweenLite } from 'gsap';

/**
 * Cluster of graph items.
 */
export class Cluster {

  public items: DataItem[];
  private renderedItems: GraphItem[];
  public intersectionMeshes: THREE.Object3D[];  
  public name: string;
  private isExpanded = false;

  private bgMesh: THREE.Mesh;
  private itemGroup: THREE.Group;

  constructor(name: string, items: DataItem[]) {
      this.items = items;
      this.name = name;
  }

  /**
   * Returns THREE render object group.
   */
  public getSceneObj() {
    const position = this.items[0].position;
    
    // create group to hold all item elements
    const itemGroup = new THREE.Group();
    itemGroup.position.fromArray(position);
    itemGroup.position.multiplyScalar(LAYOUT_CONFIG.scalingFac);

    // ---- create background circle element ----
    const bgGeometry = new THREE.CircleGeometry(5.2, LAYOUT_CONFIG.itemRadiusSegments);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,      
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    bgMesh.name = this.name; // set name to identify object when using the raycaster

    itemGroup.add(bgMesh);

    this.bgMesh = bgMesh;
    this.itemGroup = itemGroup;
    
    return {
      sceneObj: itemGroup, 
      intersectionMesh: bgMesh
    };
  }

  /**
   * Expand cluster and show all containing elements.
   */
  public expand() {
    const material = this.bgMesh.material as THREE.MeshBasicMaterial;
    material.color.set('#000000');
    material.needsUpdate = true;

    // render items
    if (!this.renderedItems) {
      this.intersectionMeshes = [];

      this.renderedItems = this.items.map(model => {
        const item = new GraphItem(model);
        const {sceneObj, intersectionMesh} = item.getSceneObj();        
        this.itemGroup.add(sceneObj);
        this.intersectionMeshes.push(intersectionMesh);
        return item;
      });
    }

    this.renderedItems.forEach(item => item.setOpacity(1));

    this.isExpanded = true;
  }

  /**
   * Collapse cluster and hide all containing elements.
   */
  public collapse() {
    const material = this.bgMesh.material as THREE.MeshBasicMaterial;
    material.color.set('#ffffff');
    material.needsUpdate = true;

    this.renderedItems.forEach(item => item.setOpacity(0));

    this.isExpanded = false;
  }

  /**
   * Set Opacity of cluster preview element. (is animated)
   */
  public setOpacity(opacity: number) {
    const material = this.bgMesh.material as THREE.MeshBasicMaterial;
    const tween = TweenLite.to(material, 0.3, {opacity, onUpdate: () => {
      material.needsUpdate = true;
    }});
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

    if (this.renderedItems) {
      this.renderedItems.forEach(item => item.scalePosition(scaleFac, duration));
    }
  }

  /**
   * Returns bounding for all elements.
   */
  public getBoundingBox() {
    const bbox = new THREE.Box3().setFromObject(this.itemGroup);
    return [
      bbox.min.toArray(),
      bbox.max.toArray(),
    ];
  }

  /**
   * Returns center which is defined by the first element.
   */
  public getCenter() {
    return new THREE.Vector3().fromArray(this.items[0].position);
  }
}
