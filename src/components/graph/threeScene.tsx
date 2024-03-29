/* tslint:disable:no-magic-numbers */
import * as React from 'react';
import * as THREE from 'three';
import { TrackballControls } from 'misc/TrackballControls';
import { TypeColors } from 'constants/colors';
import { LAYOUT_CONFIG } from 'components/graph';

require('./graph.scss');

export interface State {
  showPointerCursor: boolean;
}

const DEBUG = true;
const CHANGE_THRESHOLD = 20;

/**
 * Base class for creating three js scenes.
 */
export class ThreeScene<T, M extends State> extends React.Component<T, M> {

  private renderContainer: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected camera: THREE.PerspectiveCamera;
  private controls: THREE.TrackballControls;
  protected mouse: THREE.Vector2 = new THREE.Vector2();
  private mouseDownPos: THREE.Vector2;
  /** max mouse move distance between mouse down-up to dispatch click event */
  private clickMoveThreshold = 5;

  private currentCameraDistance = 1;
  private sceneCameraPos: THREE.Vector3 = new THREE.Vector3();
  
  private shouldAnimate: boolean = false;

  constructor(props: T) {
    super(props);

    this.onWindowResize = this.onWindowResize.bind(this);
    this.animate_ = this.animate_.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleCanvasClick = this.handleCanvasClick.bind(this);
    this.handleControlUpdate = this.handleControlUpdate.bind(this);
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

    const helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
    
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

  /**
   * Store mouse down position for custom click detection.
   */
  private handleMouseDown(event: React.MouseEvent<HTMLElement>) {
    this.mouseDownPos = new THREE.Vector2(event.clientX, event.clientY);

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
   * Custom click detection to distinguish drag from click behavior.
   */
  private handleMouseUp(event: React.MouseEvent<HTMLElement>) {
    if (!this.mouseDownPos) {
      return;
    }
    
    const distance = this.mouseDownPos.distanceTo(new THREE.Vector2(event.clientX, event.clientY));
    if (distance < this.clickMoveThreshold) {
      this.handleCanvasClick(event);
    }
  }
  
  /**
   * Handles click on canvas. Override in subclasses to add interactions.
   */
  protected handleCanvasClick(event: React.MouseEvent<HTMLElement>) {
    
  }

  /**
   * Handles update of trackball controls camera adjustment.
   */
  protected handleControlUpdate() {
    const cameraPos = this.camera.position.clone();
    const change = this.sceneCameraPos.distanceToSquared(cameraPos);

    if (change > CHANGE_THRESHOLD) {
      this.sceneCameraPos = cameraPos;
      this.onCameraUpdate();
    }
  }

  protected onCameraUpdate() {

  }

  private onWindowResize() {
    this.setRendererSize();
    this.controls.handleResize();
  }

  private setRendererSize() {
    const width = this.renderContainer.offsetWidth;
    const boundingBox = this.renderContainer.getBoundingClientRect();
    let height = window.innerHeight - boundingBox.top - 20;
    height = Math.max(height, 300);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Set pointer state for mouse on canvas hover.
   */
  public setPointerCursor(showPointer = false) {
    if (this.state.showPointerCursor !== showPointer) {
      this.setState({showPointerCursor: showPointer});
    }
  }

  /**
   * Starts animating scene.
   */
  public startAnimating() {
    if (!this.shouldAnimate) {
      this.shouldAnimate = true;
      this.animate_();
    }
  }

  /**
   * Called on each animation step.
   */
  private animate_() {
    if (this.shouldAnimate) {
      this.controls.update();
      // this.applyCameraTilt();
      this.onAnimate();
      this.renderGL();
      requestAnimationFrame(this.animate_);
    }
  }
/* 
  private applyCameraTilt() {
    const mouseTarget = this.sceneCameraPos.clone();
    mouseTarget.x += this.mouse.x * 100;
    mouseTarget.y += this.mouse.y * 100;

    this.camera.position.x += (mouseTarget.x - this.camera.position.x) * 0.1;
    this.camera.position.y += (mouseTarget.y - this.camera.position.y) * 0.1;
    // this.camera.position.y += (((this.sceneCameraPos.y * (this.mouse.y + 1)) - this.camera.position.y) * 0.1);
  } */

  /**
   * Called in each render call.
   * Override in subclasses to animate scene.
   */
  protected onAnimate() {
  }

  /**
   * Renders scene to canvas. Should only be called within animate! (within animation frame)
   */
  private renderGL() {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Adjust scene camera position to show bounding box on given center.
   */
  public zoomToFit(boundingBox: number[][], center: THREE.Vector3) {
    DEBUG && console.log('threeScene: zoom to fit', boundingBox);

    const aspect = this.camera.aspect;
    const fov = Math.tan(Math.PI * this.camera.fov / 360);
    
    const maxAbsVal = (arr) => Math.max.apply(null, arr.map(Math.abs));
    let maxDim = Math.max(maxAbsVal(boundingBox[0].slice(0, -1)), maxAbsVal(boundingBox[1].slice(0, -1)));
    maxDim *= 2;
    maxDim *= LAYOUT_CONFIG.scalingFac;
    maxDim *= 1.1;

    // TODO: scale position by scalingFac?

    const distance = maxDim / 2 / aspect / fov;
    // TODO: other camera position?
    const cameraPosition = center.clone();
    cameraPosition.z = distance;

    this.currentCameraDistance = distance;
    
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(center);
    this.sceneCameraPos = center.clone();    
    DEBUG && console.log('threeScene: new camera position', this.camera.position);
  }

  /**
   * Returns pointer where camera focuses on.
   */
  public getCameraLookAt() {
    const center = (new THREE.Vector3(0, 0, 1)).unproject(this.camera); // far target
    // TODO: may improve calculation but you know, never change a running system :)
    const direction = center.clone().sub(this.camera.position).normalize().multiplyScalar(this.currentCameraDistance).add(this.camera.position);

    return direction;
  }

  /**
   * Returns 2D position on canvas for given scene 3D point.
   */
  public getElementCoordinates(point: THREE.Vector3): THREE.Vector2 {
    const projected = point.clone().project(this.camera);
    const widthHalf = this.renderContainer.offsetWidth / 2;
    const heightHalf = this.renderContainer.offsetHeight / 2;

    return new THREE.Vector2(
      ( projected.x * widthHalf ) + widthHalf,
      - ( projected.y * heightHalf ) + heightHalf
    );
  }

  public render() {
    return (
      <div className="graph">
        <div className="graph__canvas" 
          style={this.state.showPointerCursor ? {cursor: 'pointer'} : null}
          onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp}
          onMouseMove={this.handleMouseMove} ref={(el) => { this.renderContainer = el; }} />
        {this.renderChildElements()}
      </div>
   );
  }

  /**
   * Override and implement to add custom elements to view.
   */
  protected renderChildElements() {
    return null;
  }
}
