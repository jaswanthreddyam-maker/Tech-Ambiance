import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';
import { MaterialLibrary } from '../engine/services/MaterialLibrary';

export class WorldAnchorComponent implements SceneObjectContract {
  public readonly id = 'world-anchor-platform';

  private group: THREE.Group = new THREE.Group();
  private platformMesh: THREE.Mesh | null = null;

  public initialize(ctx: EngineContext): void {
    if (ctx.qualityProfile.staticFallback) return;

    const matLib = MaterialLibrary.getInstance();
    const obsidianMat = matLib.getObsidianMaterial();
    const goldMat = matLib.getGoldMaterial();

    // 3D Mounted Stone Platform Base for Browser Mockup
    const platformGeo = new THREE.BoxGeometry(6.2, 0.35, 4.0);
    this.platformMesh = new THREE.Mesh(platformGeo, obsidianMat);
    this.platformMesh.position.set(-2.8, -1.8, -1.0);
    this.platformMesh.rotation.y = 0.15;
    this.platformMesh.rotation.x = 0.08;
    this.platformMesh.castShadow = true;
    this.platformMesh.receiveShadow = true;
    this.group.add(this.platformMesh);

    // Gold Trim Bracket Supports
    const supportGeo = new THREE.BoxGeometry(0.2, 0.8, 0.2);
    const support1 = new THREE.Mesh(supportGeo, goldMat);
    support1.position.set(-5.2, -2.2, -0.5);
    this.group.add(support1);

    const support2 = new THREE.Mesh(supportGeo, goldMat);
    support2.position.set(-0.4, -2.2, -1.5);
    this.group.add(support2);
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.group || ctx.isReducedMotion) return;

    // Soft subtle perspective tilt on mouse movement
    const targetRotY = 0.15 + ctx.interactionState.normalizedX * 0.04;
    this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotY, delta * 2.0);
  }

  public getObject3D(): THREE.Object3D {
    return this.group;
  }

  public dispose(_ctx?: EngineContext): void {
    this.group.clear();
  }
}
