
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import { TypeColors } from 'constants/colors';

const LAYOUT_CONFIG = {
    /** factor to scale item coordinates from api */
    scalingFac: 300,

    /** number of segments for item circle */
    itemRadiusSegments: 64,
};

export class GraphItem {

    private model: DataItem;

    constructor(model: DataItem) {
        this.model = model;
    }

    /**
     * Returns THREE render object group.
     */
    public getSceneObj(): THREE.Object3D {
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
      });
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
      bgMesh.name = model.id; // set name to identify object when using the raycaster
      bgMesh.position.z = -0.01;
      itemGroup.add(bgMesh);

      // ---- create image element ----
      // find smallest image
      const imageVersion = model.meta.images.length > 0 ? 
        (model.meta.images.find(image => image.width === 160) || model.meta.images[0])
        : {url: ''};


      const loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      const imgMaterial = new THREE.MeshBasicMaterial({
        // color: itemColor,
        // TODO: show color while image is loading
        map: loader.load(imageVersion.url)
      });

      const imgGeometry = new THREE.CircleGeometry(5, LAYOUT_CONFIG.itemRadiusSegments);
      itemGroup.add(new THREE.Mesh(imgGeometry, imgMaterial));

      return itemGroup;
    }
}
