import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';
import { MaterialLibrary } from '../engine/services/MaterialLibrary';

interface OrbProfile {
  mesh: THREE.Mesh;
  basePos: THREE.Vector3;
  speed: number;
  phase: number;
  personality: 'drift' | 'rotation' | 'elevation' | 'dust-thread';
  radius: number;
}

export class OrbFieldEntity implements SceneObjectContract {
  public readonly id = 'orb-field-entity';

  private group: THREE.Group = new THREE.Group();
  private orbs: OrbProfile[] = [];
  private count = 12;

  public initialize(ctx: EngineContext): void {
    if (ctx.qualityProfile.staticFallback) return;

    const profile = ctx.qualityProfile;
    this.count = profile.name === 'Ultra' ? 14 : profile.name === 'High' ? 12 : profile.name === 'Balanced' ? 8 : 4;

    const matLib = MaterialLibrary.getInstance();
    const chromeMat = matLib.getBlackChromeMaterial();

    const personalities: ('drift' | 'rotation' | 'elevation' | 'dust-thread')[] = [
      'drift',
      'rotation',
      'elevation',
      'dust-thread',
    ];

    for (let i = 0; i < this.count; i++) {
      const radius = 0.12 + Math.random() * 0.22;
      const geo = new THREE.SphereGeometry(radius, 24, 24);
      const mesh = new THREE.Mesh(geo, chromeMat);

      // Unique position around monolith space
      const basePos = new THREE.Vector3(
        (Math.random() - 0.5) * 8.5 + 2.5,
        (Math.random() - 0.5) * 4.5 + 0.2,
        (Math.random() - 0.5) * 4.0 - 1.0
      );

      mesh.position.copy(basePos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);

      this.orbs.push({
        mesh,
        basePos,
        speed: 0.15 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        personality: personalities[i % personalities.length],
        radius,
      });
    }
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.group || ctx.isReducedMotion) return;

    const time = performance.now() / 1000;

    this.orbs.forEach((orb) => {
      switch (orb.personality) {
        case 'drift':
          // Slow organic non-circular drift
          orb.mesh.position.x = orb.basePos.x + Math.sin(time * orb.speed + orb.phase) * 0.4;
          orb.mesh.position.z = orb.basePos.z + Math.cos(time * orb.speed * 0.7 + orb.phase) * 0.3;
          break;

        case 'elevation':
          // Slow elevation hover up and down
          orb.mesh.position.y = orb.basePos.y + Math.sin(time * orb.speed * 0.8 + orb.phase) * 0.5;
          break;

        case 'rotation':
          // Micro-spin and subtle movement
          orb.mesh.rotation.y += delta * orb.speed;
          orb.mesh.position.x = orb.basePos.x + Math.cos(time * orb.speed + orb.phase) * 0.2;
          break;

        case 'dust-thread':
          // Threading through atmospheric space
          orb.mesh.position.x = orb.basePos.x + Math.sin(time * orb.speed + orb.phase) * 0.35;
          orb.mesh.position.y = orb.basePos.y + Math.cos(time * orb.speed * 1.2 + orb.phase) * 0.3;
          orb.mesh.position.z = orb.basePos.z + Math.sin(time * orb.speed * 0.5 + orb.phase) * 0.25;
          break;
      }
    });
  }

  public getObject3D(): THREE.Object3D {
    return this.group;
  }

  public dispose(_ctx?: EngineContext): void {
    this.orbs.forEach(o => {
      o.mesh.geometry.dispose();
    });
    this.group.clear();
    this.orbs = [];
  }
}
