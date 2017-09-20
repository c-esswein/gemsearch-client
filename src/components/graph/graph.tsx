/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import {TrackballControls} from 'misc/TrackballControls';
import { xFetch } from 'utils';
import { TypeColors } from 'constants/colors';
import { ThreeScene } from 'components/graph/threeScene';

require('./graph.scss');

export interface Props {
  items: DataItem[];
}

/**
 * Three.js Graph visualization.
 */
export class Graph extends ThreeScene<Props> {

  private INTERSECTED: boolean;
  private positions: Float32Array;
  private colors: Float32Array;
  private particles: THREE.Points;
  private typeMapping: ItemType[];
  private raycaster: THREE.Raycaster;
  private pointGeometry: THREE.BufferGeometry;

  constructor(props: Props) {
    super(props);

  }

  componentDidMount() {
    super.componentDidMount();

    xFetch('/api/nodes')
      .then(response => response.json())
      .then(json => this.drawGraph(json));
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.items !== this.props.items) {
      this.navigateTo(nextProps.items);
    }
  }

  /** @inheritDoc */
  protected onThreeSceneCreated() {
    
    this.raycaster = new THREE.Raycaster();
  }

  /**
   * Draws graph nodes.
   * @param data json server response:
   *    nodes: contains 3D position for each node (as flatted array)
   *    typeMapping: contains type for each node
   */
  private drawGraph(data: {nodes: number[], typeMapping: ItemType[]}) {
    const PARTICLE_SIZE = 2;

    const positions = Float32Array.from(data.nodes);
    const numberOfNodes = data.nodes.length / 3;
    const colors = new Float32Array(numberOfNodes * 3);
    const sizes = new Float32Array(numberOfNodes);
    const color = new THREE.Color();
    
    const scaling = 200;
    for (let i = 0, l = numberOfNodes; i < l; i++) {
      positions[i * 3 + 0] *= scaling;
      positions[i * 3 + 1] *= scaling;
      positions[i * 3 + 2] *= scaling;

      color.setHex(TypeColors[data.typeMapping[i]] || TypeColors.default);
      color.toArray(colors as any, i * 3);

      sizes[i] = PARTICLE_SIZE * 0.5;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pointMaterial = new THREE.PointsMaterial({vertexColors : THREE.VertexColors });
    this.particles = new THREE.Points(geometry, pointMaterial);
    this.scene.add(this.particles);

    this.positions = positions;
    this.colors = colors;
    this.pointGeometry = geometry;
    this.typeMapping = data.typeMapping;

    this.startAnimating();
    /*
    xFetch('/api/graph')
      .then(response => response.json())
      .then(json => this.drawLines(json));*/
  }

  /**
   * Draws lines between nodes.
   */
  private drawLines(data: {edges: number[]}) {
    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(data.edges), 1));

    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.LineSegments(geometry, material);
    this.scene.add(line);
  }

  /**
   * Navigates to first results of given items.
   * @param items 
   */
  private navigateTo(items: DataItem[]) {
    if (!this.positions) {
      // data not loaded yet
      // TODO: store...
      return;
    }
    
    const getPosition = (item: DataItem) => {
      const i = items[0].embeddingIndex;
      return new THREE.Vector3(
        this.positions[i], this.positions[i + 1], this.positions[i + 2]
      );
    };

    const resultPos = getPosition(items[0]);
    const secondPos = getPosition(items[1]);

    const direction = resultPos.clone().sub(secondPos).multiplyScalar(0.5);
//    const cameraPos = resultPos.clone().add(direction);
    const cameraPos = resultPos.clone();

    // this.camera.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
    // this.camera.lookAt(resultPos);

    // highlight first and second
    const firstColor = new THREE.Color('#fb27a4');
    firstColor.toArray(this.colors as any, items[0].embeddingIndex * 3);
    
    const secondColor = new THREE.Color('#795548');
    firstColor.toArray(this.colors as any, items[1].embeddingIndex * 3);
    (this.pointGeometry.attributes as any).color.needsUpdate = true;
  }
  
  /** @inheritDoc */
  protected onAnimate() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.particles);

    if (intersects.length > 0) {
      const intersectIndex = intersects[0].index;
      const type = this.typeMapping[intersectIndex];
      console.log(type);
    }

  }
}
