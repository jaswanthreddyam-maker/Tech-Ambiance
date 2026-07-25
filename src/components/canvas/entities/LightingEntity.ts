import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';

export class LightingEntity implements SceneObjectContract {
  public readonly id = 'lighting-entity';

  private group: THREE.Group = new THREE.Group();
  private keyLight: THREE.DirectionalLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;
  private pedestalGoldPointLight: THREE.PointLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;

  public initialize(ctx: EngineContext): void {
    if (ctx.qualityProfile.staticFallback) return;

    // 1. Warm Gold Key Light
    this.keyLight = new THREE.DirectionalLight(0xc5a572, 1.3);
    this.keyLight.position.set(5, 10, 7);
    this.keyLight.castShadow = true;
    if (this.keyLight.shadow) {
      this.keyLight.shadow.mapSize.width = 1024;
      this.keyLight.shadow.mapSize.height = 1024;
      this.keyLight.shadow.bias = -0.0005;
    }
    this.group.add(this.keyLight);

    // 2. Cool Ambient Emerald Fill
    this.ambientLight = new THREE.AmbientLight(0x0a1f18, 0.75);
    this.group.add(this.ambientLight);

    // 3. Concentrated Pedestal Golden Glazing Energy Light Source
    this.pedestalGoldPointLight = new THREE.PointLight(0xe0c896, 2.5, 12);
    this.pedestalGoldPointLight.position.set(2.8, -0.6, -1.2);
    this.group.add(this.pedestalGoldPointLight);

    // 4. Subtle Metallic Rim Light
    this.rimLight = new THREE.DirectionalLight(0xe0c896, 0.6);
    this.rimLight.position.set(-6, 4, -5);
    this.group.add(this.rimLight);
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.group || ctx.isReducedMotion) return;

    const time = performance.now() / 1000;

    // Gentle pulse of golden energy light source every few seconds
    if (this.pedestalGoldPointLight) {
      const pulse = Math.sin(time * 0.8) * 0.45 + Math.cos(time * 0.3) * 0.2;
      this.pedestalGoldPointLight.intensity = 2.2 + pulse;
    }

    // Dynamic focus light shift from NarrativeSystem
    if (this.keyLight && ctx.narrativeState) {
      this.keyLight.intensity = THREE.MathUtils.lerp(
        this.keyLight.intensity,
        1.3 + (ctx.interactionState.scrollVelocity > 0 ? 0.2 : 0),
        delta * 2.0
      );
    }
  }

  public getObject3D(): THREE.Object3D {
    return this.group;
  }

  public dispose(_ctx?: EngineContext): void {
    this.group.clear();
  }
}
