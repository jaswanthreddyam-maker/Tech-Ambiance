import type * as THREE from 'three';
import type { EventBus } from './EventBus';
import type { EngineContext } from './types';

export interface SceneObjectContract {
  id: string;
  initialize: (ctx: EngineContext) => void;
  update: (ctx: EngineContext, delta: number) => void;
  resize?: (ctx: EngineContext, width: number, height: number) => void;
  pause?: (ctx: EngineContext) => void;
  resume?: (ctx: EngineContext) => void;
  dispose: (ctx: EngineContext) => void;
  getObject3D: () => THREE.Object3D;
}

export class SceneRegistry {
  private _eventBus: EventBus;
  private objects: Map<string, SceneObjectContract> = new Map();

  constructor(eventBus: EventBus) {
    this._eventBus = eventBus;
  }

  public getEventBus(): EventBus {
    return this._eventBus;
  }

  public register(object: SceneObjectContract, ctx?: EngineContext): void {
    if (this.objects.has(object.id)) {
      console.warn(`[SceneRegistry] Object "${object.id}" is already registered.`);
      return;
    }
    this.objects.set(object.id, object);

    if (ctx) {
      object.initialize(ctx);
      if (ctx.scene) {
        ctx.scene.add(object.getObject3D());
      }
    }
  }

  public unregister(id: string, ctx?: EngineContext): void {
    const object = this.objects.get(id);
    if (!object) return;

    if (ctx?.scene) {
      ctx.scene.remove(object.getObject3D());
      object.dispose(ctx);
    }

    this.objects.delete(id);
  }

  public tick(ctx: EngineContext, delta: number): void {
    this.objects.forEach(obj => {
      obj.update(ctx, delta);
    });
  }

  public destroy(ctx?: EngineContext): void {
    Array.from(this.objects.keys()).forEach(id => {
      this.unregister(id, ctx);
    });
    this.objects.clear();
  }
}
