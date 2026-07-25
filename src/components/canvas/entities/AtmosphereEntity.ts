import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';

export class AtmosphereEntity implements SceneObjectContract {
  public readonly id = 'atmosphere-entity';

  private group: THREE.Group = new THREE.Group();
  private cloudPlanes: THREE.Mesh[] = [];

  public initialize(ctx: EngineContext): void {
    if (ctx.qualityProfile.staticFallback) return;

    // 1. Setup Scene Depth Fog for atmospheric perspective
    if (ctx.scene) {
      ctx.scene.fog = new THREE.FogExp2(0x06120e, 0.035);
    }

    // 2. Upper Atmospheric Cloud Planes
    const cloudGeo = new THREE.PlaneGeometry(28, 12);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const cctx = canvas.getContext('2d');

    if (cctx) {
      const grad = cctx.createRadialGradient(128, 128, 20, 128, 128, 128);
      grad.addColorStop(0, 'rgba(197, 165, 114, 0.18)');
      grad.addColorStop(0.5, 'rgba(6, 41, 30, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      cctx.fillStyle = grad;
      cctx.fillRect(0, 0, 256, 256);
    }

    const cloudTex = new THREE.CanvasTexture(canvas);

    for (let i = 0; i < 3; i++) {
      const cloudMat = new THREE.MeshBasicMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.3 - i * 0.06,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const plane = new THREE.Mesh(cloudGeo, cloudMat);
      plane.position.set(-2 + i * 4, 3 + i * 1.2, -6 - i * 3);
      this.group.add(plane);
      this.cloudPlanes.push(plane);
    }
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.group || ctx.isReducedMotion) return;

    const time = performance.now() / 1000;

    // Very slow horizontal travel for cloud layers (creates atmospheric depth)
    this.cloudPlanes.forEach((plane, idx) => {
      const speed = (0.04 + idx * 0.02);
      plane.position.x += delta * speed;
      if (plane.position.x > 14) {
        plane.position.x = -14;
      }
      plane.position.y = (3 + idx * 1.2) + Math.sin(time * 0.2 + idx) * 0.1;
    });
  }

  public getObject3D(): THREE.Object3D {
    return this.group;
  }

  public dispose(_ctx?: EngineContext): void {
    this.cloudPlanes.forEach(p => {
      p.geometry.dispose();
      (p.material as THREE.Material).dispose();
    });
    this.group.clear();
    this.cloudPlanes = [];
  }
}
