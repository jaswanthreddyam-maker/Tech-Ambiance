import * as THREE from 'three';
import { EventBus } from './EventBus';
import type { QualityProfile, ViewportSize } from './types';
import { AssetEngine } from './AssetEngine';

export class RenderingEngine {
  private eventBus: EventBus;
  private assetEngine: AssetEngine;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private viewport: ViewportSize = { width: 1, height: 1, aspect: 1, dpr: 1 };

  constructor(eventBus: EventBus, assetEngine: AssetEngine) {
    this.eventBus = eventBus;
    this.assetEngine = assetEngine;
  }

  public getAssetEngine(): AssetEngine {
    return this.assetEngine;
  }

  public boot(container: HTMLElement, canvas: HTMLCanvasElement, profile: QualityProfile): void {
    if (profile.staticFallback) return;

    const width = container.clientWidth || window.innerWidth || 800;
    const height = container.clientHeight || window.innerHeight || 600;
    const dpr = Math.min(window.devicePixelRatio || 1, profile.maxDpr);

    this.viewport = {
      width,
      height,
      aspect: width / height,
      dpr,
    };

    // 1. Initialize WebGLRenderer
    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: profile.name === 'Ultra' || profile.name === 'High',
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(dpr);
    } catch (err) {
      console.error('[RenderingEngine] Failed to create WebGLRenderer:', err);
      this.eventBus.emit('performance.contextLost', undefined);
      return;
    }

    // 2. Initialize Scene
    this.scene = new THREE.Scene();

    // 3. Initialize Camera
    this.camera = new THREE.PerspectiveCamera(45, this.viewport.aspect, 0.1, 100);
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    // 4. Ambient Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xc9a56a, 1.2);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);

    // Context loss listeners
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.eventBus.emit('performance.contextLost', undefined);
    });

    canvas.addEventListener('webglcontextrestored', () => {
      this.eventBus.emit('performance.contextRestored', undefined);
    });
  }

  public resize(width: number, height: number, maxDpr: number): void {
    if (!this.renderer || !this.camera) return;

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    this.viewport = {
      width,
      height,
      aspect: width / height,
      dpr,
    };

    this.camera.aspect = this.viewport.aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(dpr);

    this.eventBus.emit('render.resize', { width, height, dpr });
  }

  public render(time: number, delta: number, scrollVelocity: number): void {
    if (!this.renderer || !this.scene || !this.camera) return;

    this.eventBus.emit('render.tick', { time, delta, scrollVelocity });
    this.renderer.render(this.scene, this.camera);
  }

  public getScene(): THREE.Scene | null {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  public getViewport(): ViewportSize {
    return this.viewport;
  }

  public destroy(): void {
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
  }
}
