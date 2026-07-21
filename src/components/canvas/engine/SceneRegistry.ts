import type * as THREE from 'three';
import type { EventBus } from './EventBus';
import type { EngineContext } from './types';

export interface SceneObject {
  id: string;
  init?: (ctx: EngineContext) => void;
  tick?: (ctx: EngineContext, delta: number) => void;
  getObject3D?: () => THREE.Object3D;
  destroy?: () => void;
}

export class SceneRegistry {
  private _eventBus: EventBus;
  private objects: Map<string, SceneObject> = new Map();

  constructor(eventBus: EventBus) {
    this._eventBus = eventBus;
  }

  public getEventBus(): EventBus {
    return this._eventBus;
  }

  public register(object: SceneObject, ctx?: EngineContext): void {
    if (this.objects.has(object.id)) {
      console.warn(`[SceneRegistry] Object "${object.id}" is already registered.`);
      return;
    }
    this.objects.set(object.id, object);

    if (ctx && object.init) {
      object.init(ctx);
    }

    if (ctx?.scene && object.getObject3D) {
      const obj3D = object.getObject3D();
      ctx.scene.add(obj3D);
    }
  }

  public unregister(id: string, ctx?: EngineContext): void {
    const object = this.objects.get(id);
    if (!object) return;

    if (ctx?.scene && object.getObject3D) {
      ctx.scene.remove(object.getObject3D());
    }

    if (object.destroy) {
      object.destroy();
    }

    this.objects.delete(id);
  }

  public tick(ctx: EngineContext, delta: number): void {
    this.objects.forEach(obj => {
      if (obj.tick) {
        obj.tick(ctx, delta);
      }
    });
  }

  public destroy(ctx?: EngineContext): void {
    Array.from(this.objects.keys()).forEach(id => {
      this.unregister(id, ctx);
    });
    this.objects.clear();
  }
}
