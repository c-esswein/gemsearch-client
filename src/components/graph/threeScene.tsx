/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'misc/TrackballControls';
import { TypeColors } from 'constants/colors';
import { LAYOUT_CONFIG } from 'components/graph';

require('./graph.scss');

interface State {
  showPointerCursor: boolean;
}

const DEBUG = true;

/**
 * Base class for creating three js scenes.
 */
export class ThreeScene<T> extends React.Component<T, State> {

  private renderContainer: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  private controls: THREE.TrackballControls;
  protected mouse: THREE.Vector2 = new THREE.Vector2();
  
  private shouldAnimate: boolean = false;

  constructor(props: T) {
    super(props);

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate_ = this.animate_.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
    this.handleControlUpdate = this.handleControlUpdate.bind(this);

    this.state = {
      showPointerCursor: false
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize, false);

    this.renderThreeScene(this.renderContainer);
  }

  componentWillUnmount() {
    this.shouldAnimate = false;
    this.renderer.dispose();
    (this.controls as any).dispose(); // dispose is not in @type file...

    window.removeEventListener('resize', this.onWindowResize, false);
  }

  private renderThreeScene(renderContainer: HTMLElement) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.y = 150;
    this.camera.position.z = 350;
    
    this.controls = new TrackballControls(this.camera, this.renderContainer);
    this.controls.addEventListener('change', this.handleControlUpdate);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.dynamicDampingFactor = 0.3;
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.setRendererSize();
    renderContainer.appendChild(this.renderer.domElement);

    this.onThreeSceneCreated();
  }

  /**
   * Called when three js canvas and scene is created. Override in subclasses.
   */
  protected onThreeSceneCreated() {

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
  
  /**
   * Handles click on canvas. Override in subclasses to add interactions.
   */
  protected handleCanvasClick(event: React.MouseEvent<HTMLElement>) {
    
  }

  protected handleControlUpdate() {
    this.renderGL();
  }

  private onWindowResize() {
    this.setRendererSize();
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

  public setPointerCursor(showPointer = false) {
    if (this.state.showPointerCursor !== showPointer) {
      this.setState({showPointerCursor: showPointer});
    }
  }

  public startAnimating() {
    this.shouldAnimate = true;
    this.animate_();
  }

  private animate_() {
    if (this.shouldAnimate) {
      this.controls.update();
      this.onAnimate();
      this.renderGL();
      requestAnimationFrame(this.animate_);
    }
  }

  /**
   * Called in each render call.
   * Override in subclasses to animate scene.
   */
  protected onAnimate() {
  }

  private renderGL() {
    this.renderer.render(this.scene, this.camera);
  }

  public zoomToFit(boundingBox: number[][]) {
    DEBUG && console.log('threeScene: zoom to fit', boundingBox);

    const aspect = this.camera.aspect;
    const fov = Math.tan(Math.PI * this.camera.fov / 360);
    
    const maxAbsVal = (arr) => Math.max.apply(null, arr.map(Math.abs));
    let maxDim = Math.max(maxAbsVal(boundingBox[0].slice(0, -1)), maxAbsVal(boundingBox[1].slice(0, -1)));
    maxDim *= 2;
    maxDim *= LAYOUT_CONFIG.scalingFac;
    maxDim *= 1.1;

    const distance = maxDim/ 2 / aspect / fov;
    const cameraPosition = new THREE.Vector3(
      0,
      0,
      distance
    );
    
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    DEBUG && console.log('threeScene: new camera position', this.camera.position);
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
          <div className="graph__canvas" 
            style={this.state.showPointerCursor ? {cursor: 'pointer'} : null}
            onClick={this.handleCanvasClick}
            onMouseMove={this.handleMouseMove} ref={(el) => { this.renderContainer = el; }} />
      </div>
   );
  }
}