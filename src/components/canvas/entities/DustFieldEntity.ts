import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';
import type { WindState } from '../engine/types/state';

export class DustFieldEntity implements SceneObjectContract {
  public readonly id = 'dust-field-entity';

  private particlesMesh: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.PointsMaterial | null = null;
  private particleCount = 350;
  private windVector: THREE.Vector3 = new THREE.Vector3(0.2, 0.05, 0);

  public initialize(ctx: EngineContext): void {
    if (ctx.qualityProfile.staticFallback) return;

    const profile = ctx.qualityProfile;
    this.particleCount = profile.name === 'Ultra' ? 450 : profile.name === 'High' ? 350 : profile.name === 'Balanced' ? 180 : 80;

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.05 + 0.02;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    this.material = new THREE.PointsMaterial({
      color: 0xc5a572,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particlesMesh = new THREE.Points(this.geometry, this.material);
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.geometry || ctx.isReducedMotion) return;

    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;

      // Move with organic wind vector
      posArray[idx] += (this.windVector.x * 0.4 + Math.sin(i + performance.now() * 0.001) * 0.02) * delta;
      posArray[idx + 1] += (0.08 + Math.cos(i + performance.now() * 0.001) * 0.02) * delta; // Floating upward
      posArray[idx + 2] += (this.windVector.z * 0.2) * delta;

      // Wrap around bounds seamlessly
      if (posArray[idx] > 9) posArray[idx] = -9;
      if (posArray[idx + 1] > 6) posArray[idx + 1] = -6;
      if (posArray[idx + 2] > 5) posArray[idx + 2] = -5;
    }

    posAttr.needsUpdate = true;
  }

  public onWindUpdated(windState: WindState): void {
    this.windVector.copy(windState.direction).multiplyScalar(windState.speed);
  }

  public getObject3D(): THREE.Object3D {
    return this.particlesMesh || new THREE.Object3D();
  }

  public dispose(_ctx?: EngineContext): void {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    this.particlesMesh = null;
  }
}
