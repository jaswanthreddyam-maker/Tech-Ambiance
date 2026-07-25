import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';

export class CameraNarrativeEntity implements SceneObjectContract {
  public readonly id = 'camera-narrative-entity';

  private dummyObject: THREE.Object3D = new THREE.Object3D();
  private basePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 10);
  private targetPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 10);

  public initialize(ctx: EngineContext): void {
    if (!ctx.camera) return;
    this.basePosition.copy(ctx.camera.position);
    this.targetPosition.copy(ctx.camera.position);
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!ctx.camera || ctx.isReducedMotion) return;

    const time = performance.now() / 1000;

    // Organic Respiratory Breathing Rhythm (inhale -> pause -> exhale -> pause)
    const breathCycle = Math.sin(time * 0.4);
    const breathingOffsetZ = breathCycle * 0.12;
    const breathingOffsetY = Math.cos(time * 0.3) * 0.06;

    // Mouse Sway (2-4 degrees max, lerped)
    const mouseSwayX = ctx.interactionState.normalizedX * 0.35;
    const mouseSwayY = ctx.interactionState.normalizedY * 0.25;

    // Scroll narrative camera displacement (slight dolly zoom)
    const scrollDollyZ = ctx.interactionState.scrollOffset * 0.002;

    this.targetPosition.x = mouseSwayX;
    this.targetPosition.y = breathingOffsetY + mouseSwayY;
    this.targetPosition.z = 10 - scrollDollyZ + breathingOffsetZ;

    ctx.camera.position.lerp(this.targetPosition, delta * 2.2);
    ctx.camera.lookAt(0, 0, 0);
  }

  public getObject3D(): THREE.Object3D {
    return this.dummyObject;
  }

  public dispose(_ctx?: EngineContext): void {}
}
