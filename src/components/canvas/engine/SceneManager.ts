import { EventBus } from './EventBus';
import { PerformanceEngine } from './PerformanceEngine';
import { InteractionEngine } from './InteractionEngine';
import { MotionEngine } from './MotionEngine';
import { NarrativeEngine } from './NarrativeEngine';
import { AssetEngine } from './AssetEngine';
import { RenderingEngine } from './RenderingEngine';
import { SceneRegistry } from './SceneRegistry';
import type { EngineContext } from './types';

import { BlueprintNodes } from '../objects/BlueprintNodes';

export class SceneManager {
  private eventBus: EventBus;
  private performanceEngine: PerformanceEngine;
  private interactionEngine: InteractionEngine;
  private motionEngine: MotionEngine;
  private narrativeEngine: NarrativeEngine;
  private assetEngine: AssetEngine;
  private renderingEngine: RenderingEngine;
  private sceneRegistry: SceneRegistry;

  private isPaused: boolean = false;

  constructor() {
    this.eventBus = new EventBus();
    this.performanceEngine = new PerformanceEngine(this.eventBus);
    this.interactionEngine = new InteractionEngine(this.eventBus);
    this.motionEngine = new MotionEngine();
    this.narrativeEngine = new NarrativeEngine(this.eventBus);
    this.assetEngine = new AssetEngine(this.eventBus);
    this.renderingEngine = new RenderingEngine(this.eventBus, this.assetEngine);
    this.sceneRegistry = new SceneRegistry(this.eventBus);

    // Listen to pause events
    this.eventBus.on('performance.pause', ({ isPaused }) => {
      this.isPaused = isPaused;
    });
  }

  public getSceneRegistry(): SceneRegistry {
    return this.sceneRegistry;
  }

  public getMotionEngine(): MotionEngine {
    return this.motionEngine;
  }

  public boot(container: HTMLElement, canvas: HTMLCanvasElement): void {
    // 1. Boot performance benchmarking & quality profiles
    this.performanceEngine.boot(container);

    // 2. Boot input event normalization
    this.interactionEngine.boot(container);

    // 3. Boot narrative story state machine & idle timer
    this.narrativeEngine.boot();

    // 4. Boot WebGL rendering engine
    const profile = this.performanceEngine.getProfile();
    this.renderingEngine.boot(container, canvas, profile);

    // 5. Register Phase DA-2A BlueprintNodes object in SceneRegistry
    const ctx = this.getEngineContext(container, canvas);
    this.sceneRegistry.register(new BlueprintNodes(), ctx);
  }

  public tick(time: number, delta: number, scrollVelocity: number = 0): void {
    if (this.isPaused) return;

    const profile = this.performanceEngine.getProfile();
    if (profile.staticFallback) return;

    // Update modular scene objects in registry
    const container = this.renderingEngine.getRenderer()?.domElement.parentElement;
    const canvas = this.renderingEngine.getRenderer()?.domElement;
    if (container && canvas) {
      const ctx = this.getEngineContext(container, canvas);
      this.sceneRegistry.tick(ctx, delta);
    }

    this.renderingEngine.render(time, delta, scrollVelocity);
  }

  public updateScroll(offset: number, velocity: number): void {
    this.interactionEngine.updateScroll(offset, velocity);
  }

  public resize(width: number, height: number): void {
    const profile = this.performanceEngine.getProfile();
    this.renderingEngine.resize(width, height, profile.maxDpr);
  }

  public getEventBus(): EventBus {
    return this.eventBus;
  }

  public getEngineContext(container: HTMLElement, canvas: HTMLCanvasElement): EngineContext {
    return {
      container,
      canvas,
      renderer: this.renderingEngine.getRenderer(),
      camera: this.renderingEngine.getCamera(),
      scene: this.renderingEngine.getScene(),
      viewport: this.renderingEngine.getViewport(),
      interactionState: this.interactionEngine.getState(),
      narrativeState: this.narrativeEngine.getState(),
      visitedChapters: this.narrativeEngine.getVisitedChapters(),
      qualityProfile: this.performanceEngine.getProfile(),
      isPaused: this.isPaused,
      isReducedMotion: this.performanceEngine.checkIsReducedMotion(),
    };
  }

  public destroy(): void {
    this.renderingEngine.destroy();
    this.assetEngine.destroy();
    this.narrativeEngine.destroy();
    this.interactionEngine.destroy();
    this.performanceEngine.destroy();
    this.eventBus.clear();
  }
}
