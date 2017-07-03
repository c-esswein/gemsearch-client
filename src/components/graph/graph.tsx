/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { DataItem, ItemType } from 'types';
import {TrackballControls} from 'misc/TrackballControls';
import { xFetch } from 'utils';
import { TypeColors } from 'constants/colors';

require('./graph.scss');

export interface Props {
  items: DataItem[];
}

/**
 * Three.js Graph visualization.
 */
export class Graph extends React.Component<Props, null> {

  private renderContainer: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: THREE.TrackballControls;
  private mouse: {x: number, y: number};
  private INTERSECTED: boolean;
  private positions: Float32Array;
  private particles: THREE.Points;
  private typeMapping: ItemType[];
  private raycaster: THREE.Raycaster;

  private shouldAnimate: boolean = false;

  constructor(props) {
    super(props);

    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    this.renderThreeScene(this.renderContainer);

    xFetch('/api/nodes')
      .then(response => response.json())
      .then(json => this.drawGraph(json));
    /*this.drawGraph({
      nodes: [
        0, 0, 0, 
        0, 1, 1, 
        0, .5, .5,
        1, .3, .3,
      ],
      typeMapping: ['track', 'track', 'track', 'artist', 'artist']
    });

    this.drawLines({
      edges: [
        0, 2,
        1, 3,
      ]
    });*/
  }

  componentWillUnmount() {
    this.shouldAnimate = false;
    this.renderer.dispose();

    window.removeEventListener('resize', this.onWindowResize.bind(this), false);
  }

  private renderThreeScene(renderContainer: HTMLElement) {
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.y = 150;
    this.camera.position.z = 350;
    this.controls = new TrackballControls(this.camera, this.renderContainer);

    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.dynamicDampingFactor = 0.3;
    this.controls.addEventListener('change', this.renderGL.bind(this));
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.setRendererSize();
    renderContainer.appendChild(this.renderer.domElement);
    
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
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
    this.typeMapping = data.typeMapping;

    this.shouldAnimate = true;
    this.animate();
    
    xFetch('/api/graph')
      .then(response => response.json())
      .then(json => this.drawLines(json));
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
  
  private handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    // calculate relative position
    const elPos = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX - elPos.left;
    const clientY = event.clientY - elPos.top;
    
    const width = this.renderContainer.offsetWidth;
    const height = this.renderContainer.offsetHeight;

    this.mouse.x = (clientX / width) * 2 - 1;
    this.mouse.y = - (clientY / height) * 2 + 1;
  }

  private onWindowResize() {
    this.controls.handleResize();
  }

  private setRendererSize() {
    const width = this.renderContainer.offsetWidth;
    let height = window.innerHeight - this.renderContainer.offsetTop;
    height = Math.max(height, 300);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate() {
    if (this.shouldAnimate) {
      this.controls.update();
      this.renderGL();
      requestAnimationFrame(this.animate.bind(this));
    }
  }

  private renderGL() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.particles);

    if (intersects.length > 0) {
      const type = this.typeMapping[intersects[0].index];
      console.log(type);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public render() {

    // TODO: render type colors in type filter and remove hints here
    return (
      <div className="graph">
          <div className="graph__type-colors">
            {Object.keys(TypeColors).map(type => (
              <div className="graph__type-color" key={type} style={{color: '#' + TypeColors[type].toString(16)}}>
                {type}
              </div>
            ))}
          </div>
          <div className="graph__canvas" onMouseMove={this.handleMouseMove} ref={(el) => { this.renderContainer = el; }} />
      </div>
   );
  }
}
