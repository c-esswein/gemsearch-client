
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import { TypeColors } from 'constants/colors';
import { LAYOUT_CONFIG } from 'components/graph';
import { GraphItem } from 'components/graph/graphItem';

/**
 * Cluster of graph items.
 */
export class Cluster {

  private items: DataItem[];
  private renderedItems: GraphItem[];
  private name: string;

  private bgMesh: THREE.Mesh;
  private itemGroup: THREE.Group;

  constructor(name: string, items: DataItem[]) {
      this.items = items;
      this.name = name;
  }

  /**
   * Returns THREE render object group.
   */
  public getSceneObj(): THREE.Object3D {
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
    
    return itemGroup;
  }

  public expand() {
    const material = this.bgMesh.material as THREE.MeshBasicMaterial;
    material.color.set('#000000');
    material.needsUpdate = true;

    // render items
    if (!this.renderedItems) {
      this.renderedItems = this.items.map(model => {
        const item = new GraphItem(model);
        this.itemGroup.add(item.getSceneObj());
        return item;
      });
    } else {
      this.renderedItems.forEach(item => item.setOpacity(1));
    }
  }

  public collapse() {
    const material = this.bgMesh.material as THREE.MeshBasicMaterial;
    material.color.set('#ffffff');
    material.needsUpdate = true;

    this.renderedItems.forEach(item => item.setOpacity(0));
  }

  public setOpacity(opacity: number) {
    const material = this.bgMesh.material as THREE.MeshBasicMaterial;
    material.opacity = opacity;
    material.needsUpdate = true;
  }
}
