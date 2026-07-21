import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';

export class ParticleDust implements SceneObjectContract {
  public readonly id = 'particle-dust';

  private particlesMesh: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.PointsMaterial | null = null;
  private initialPositions: Float32Array | null = null;
  private particleCount = 300;

  public initialize(ctx: EngineContext): void {
    const profile = ctx.qualityProfile;
    if (profile.staticFallback) return;

    // Reduce particle count on lower quality profiles
    this.particleCount = profile.name === 'Ultra' ? 400 : profile.name === 'High' ? 300 : profile.name === 'Balanced' ? 150 : 80;

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    this.initialPositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() - 0.5) * 16;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 6;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      this.initialPositions[i * 3] = x;
      this.initialPositions[i * 3 + 1] = y;
      this.initialPositions[i * 3 + 2] = z;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    this.material = new THREE.PointsMaterial({
      color: 0xc9a56a,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    this.particlesMesh = new THREE.Points(this.geometry, this.material);
  }

  public update(ctx: EngineContext, _delta: number): void {
    if (!this.geometry || !this.initialPositions) return;

    const time = performance.now() / 1000;
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const initX = this.initialPositions[idx];
      const initY = this.initialPositions[idx + 1];

      // Subtle organic floating movement
      posArray[idx] = initX + Math.sin(time * 0.5 + i) * 0.15 + ctx.interactionState.normalizedX * 0.2;
      posArray[idx + 1] = initY + Math.cos(time * 0.4 + i * 0.8) * 0.15 + ctx.interactionState.normalizedY * 0.2;
    }

    posAttr.needsUpdate = true;
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
