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

  renderContainer: HTMLElement;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: THREE.TrackballControls;
  mouse: {x: number, y: number};
  INTERSECTED: boolean;

  componentDidMount() {
    this.renderThreeScene(this.renderContainer);

    xFetch('/api/graph')
      .then(response => response.json())
      .then(json => this.drawGraph(json));
  }

  componentWillUnmount() {
    this.renderer.dispose();
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


/*
    var cube = new THREE.Mesh(new THREE.CubeGeometry( 200, 200, 200 ), new THREE.MeshNormalMaterial() );
    cube.position.y = 150;
    this.scene.add(cube);*/
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.setRendererSize();
    renderContainer.appendChild(this.renderer.domElement);
    
    // raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
    
    this.animate();
  }

  private drawGraph(data: {nodes: number[], typeMapping: ItemType[], graph: number[]}) {
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
    const particles = new THREE.Points(geometry, pointMaterial);
    this.scene.add(particles);

    // this.drawLines(data.graph, positions);
  }

  /**
   * Draws lines between nodes
   * @param lines Array of Pairs which represents connected nodes.
   * @param nodes Node positions.
   */
  private drawLines(lines: number[], nodes: Float32Array) {
  /*
    var positions = new Float32Array(lines.length * 3 * 2);

    var copyPoint = (target: Float32Array, i: number, source: Float32Array, j: number) => {
      target[i * 3 + 0] = source[j * 3 + 0];
      target[i * 3 + 1] = source[j * 3 + 1];
      target[i * 3 + 2] = source[j * 3 + 2];
    };

    lines.forEach((line: number[], i: number) => {
      copyPoint(positions, i * 2 + 0, nodes, line[0]);
      copyPoint(positions, i * 2 + 1, nodes, line[1]);
    });*/

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(nodes, 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(lines), 1));

    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
  }
  
  private onDocumentMouseMove(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
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
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderGL();
    // stats.update();
  }

  private renderGL() {
    /*
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;
    var geometry = particles.geometry;
    var attributes = geometry.attributes;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObject(particles);
    if (intersects.length > 0) {
      if (this.INTERSECTED != intersects[ 0 ].index) {
        attributes.size.array[ this.INTERSECTED ] = PARTICLE_SIZE;
        this.INTERSECTED = intersects[ 0 ].index;
        attributes.size.array[ this.INTERSECTED ] = PARTICLE_SIZE * 1.25;
        attributes.size.needsUpdate = true;
      }
    } else if (this.INTERSECTED !== null) {
      attributes.size.array[ this.INTERSECTED ] = PARTICLE_SIZE;
      attributes.size.needsUpdate = true;
      this.INTERSECTED = null;
    }
    */
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
          <div className="graph__canvas" ref={(el) => { this.renderContainer = el; }} />
      </div>
   );
  }
}
