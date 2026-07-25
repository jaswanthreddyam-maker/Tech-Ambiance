import { SceneManager } from './SceneManager';
import { EventBus } from './EventBus';
import { WorldSimulationSystem } from './systems/WorldSimulationSystem';
import { NarrativeSystem } from './systems/NarrativeSystem';
import { MonolithEntity } from '../entities/MonolithEntity';
import { OrbFieldEntity } from '../entities/OrbFieldEntity';
import { AtmosphereEntity } from '../entities/AtmosphereEntity';
import { LightingEntity } from '../entities/LightingEntity';
import { DustFieldEntity } from '../entities/DustFieldEntity';
import { CameraNarrativeEntity } from '../entities/CameraNarrativeEntity';
import { WorldAnchorComponent } from '../entities/WorldAnchorComponent';

export type EngineLifecycleState =
  | 'Boot'
  | 'Load'
  | 'Warmup'
  | 'Interactive'
  | 'Background'
  | 'Sleep'
  | 'Dispose';

export class WorldManager {
  private sceneManager: SceneManager;
  private eventBus: EventBus;
  private simulationSystem: WorldSimulationSystem;
  private narrativeSystem: NarrativeSystem;
  private lifecycleState: EngineLifecycleState = 'Boot';

  private dustEntity: DustFieldEntity | null = null;

  constructor() {
    this.sceneManager = new SceneManager();
    this.eventBus = this.sceneManager.getEventBus();
    this.simulationSystem = new WorldSimulationSystem(this.eventBus);
    this.narrativeSystem = new NarrativeSystem(this.eventBus);

    // Listen to wind updates to pass to DustFieldEntity
    this.eventBus.on('wind.updated', (windState: any) => {
      if (this.dustEntity) {
        this.dustEntity.onWindUpdated(windState);
      }
    });
  }

  public boot(container: HTMLElement, canvas: HTMLCanvasElement): void {
    this.lifecycleState = 'Boot';
    this.sceneManager.boot(container, canvas);

    this.lifecycleState = 'Load';
    const ctx = this.sceneManager.getEngineContext(container, canvas);
    const registry = this.sceneManager.getSceneRegistry();

    // Register pure event-driven DA Engine entities
    this.dustEntity = new DustFieldEntity();

    registry.register(new AtmosphereEntity(), ctx);
    registry.register(new LightingEntity(), ctx);
    registry.register(new MonolithEntity(), ctx);
    registry.register(new OrbFieldEntity(), ctx);
    registry.register(this.dustEntity, ctx);
    registry.register(new CameraNarrativeEntity(), ctx);
    registry.register(new WorldAnchorComponent(), ctx);

    this.lifecycleState = 'Warmup';
    // Single warmup tick
    this.tick(0, 0.016, 0);

    this.lifecycleState = 'Interactive';
    this.eventBus.emit('world.lifecycle', { state: this.lifecycleState });
  }

  public tick(time: number, delta: number, scrollVelocity: number = 0): void {
    if (this.lifecycleState === 'Sleep' || this.lifecycleState === 'Dispose') return;

    // 1. Tick Environmental World Simulation
    const worldState = this.simulationSystem.tick(time, delta);

    // 2. Tick Narrative System (Section focus & camera)
    this.narrativeSystem.tick(worldState, delta);

    // 3. Tick SceneManager render loop
    this.sceneManager.tick(time, delta, scrollVelocity);
  }

  public updateScroll(offset: number, velocity: number): void {
    this.simulationSystem.updateScroll(offset, velocity);
    this.sceneManager.updateScroll(offset, velocity);
  }

  public resize(width: number, height: number): void {
    this.sceneManager.resize(width, height);
  }

  public getSimulationSystem(): WorldSimulationSystem {
    return this.simulationSystem;
  }

  public getLifecycleState(): EngineLifecycleState {
    return this.lifecycleState;
  }

  public getSceneManager(): SceneManager {
    return this.sceneManager;
  }

  public destroy(): void {
    this.lifecycleState = 'Dispose';
    this.sceneManager.destroy();
    this.dustEntity = null;
  }
}
