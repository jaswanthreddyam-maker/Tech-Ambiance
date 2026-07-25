import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';
import { MaterialLibrary } from '../engine/services/MaterialLibrary';

export class MonolithEntity implements SceneObjectContract {
  public readonly id = 'monolith-entity';

  private group: THREE.Group = new THREE.Group();
  private monolithMesh: THREE.Mesh | null = null;
  private pedestalMesh: THREE.Mesh | null = null;

  private targetRotationX: number = 0;
  private targetRotationY: number = 0;
  private currentRotationX: number = 0;
  private currentRotationY: number = 0;

  public initialize(ctx: EngineContext): void {
    if (ctx.qualityProfile.staticFallback) return;

    const matLib = MaterialLibrary.getInstance();
    const obsidianMat = matLib.getObsidianMaterial();
    const goldMat = matLib.getGoldMaterial();

    // 1. Create Monolithic "TA" Architecture (40-Ton grounded monument)
    const shapes: THREE.Shape[] = [];

    // 'T' Shape
    const tShape = new THREE.Shape();
    tShape.moveTo(-1.6, 1.2);
    tShape.lineTo(1.6, 1.2);
    tShape.lineTo(1.6, 0.7);
    tShape.lineTo(0.4, 0.7);
    tShape.lineTo(0.4, -1.2);
    tShape.lineTo(-0.4, -1.2);
    tShape.lineTo(-0.4, 0.7);
    tShape.lineTo(-1.6, 0.7);
    tShape.closePath();
    shapes.push(tShape);

    // Extrude with bevels for luxury craftsmanship
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const geometry = new THREE.ExtrudeGeometry(tShape, extrudeSettings);
    geometry.center();

    this.monolithMesh = new THREE.Mesh(geometry, obsidianMat);
    this.monolithMesh.position.set(0, 0.4, 0);
    this.monolithMesh.castShadow = true;
    this.monolithMesh.receiveShadow = true;
    this.group.add(this.monolithMesh);

    // 2. Heavy Pedestal Monument Base
    const pedestalGeo = new THREE.BoxGeometry(4.2, 0.4, 1.6);
    this.pedestalMesh = new THREE.Mesh(pedestalGeo, obsidianMat);
    this.pedestalMesh.position.set(0, -1.1, 0);
    this.pedestalMesh.castShadow = true;
    this.pedestalMesh.receiveShadow = true;
    this.group.add(this.pedestalMesh);

    // Subtle gold rim outline on pedestal edge
    const goldTrimGeo = new THREE.BoxGeometry(4.25, 0.04, 1.65);
    const goldTrimMesh = new THREE.Mesh(goldTrimGeo, goldMat);
    goldTrimMesh.position.set(0, -0.9, 0);
    this.group.add(goldTrimMesh);

    // Scale and positioning in 3D scene
    this.group.position.set(2.8, 0.2, -1.5);
    this.group.scale.set(1.15, 1.15, 1.15);
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.group || ctx.isReducedMotion) return;

    // Sub-pixel heavy mouse sway (max 2-3 degrees) with high inertia lerp
    this.targetRotationY = ctx.interactionState.normalizedX * 0.05;
    this.targetRotationX = -ctx.interactionState.normalizedY * 0.04;

    this.currentRotationX = THREE.MathUtils.lerp(this.currentRotationX, this.targetRotationX, delta * 2.0);
    this.currentRotationY = THREE.MathUtils.lerp(this.currentRotationY, this.targetRotationY, delta * 2.0);

    this.group.rotation.x = this.currentRotationX;
    this.group.rotation.y = this.currentRotationY;

    // 40-Ton Micro-vibration / heavy breath
    const time = performance.now() / 1000;
    this.group.position.y = 0.2 + Math.sin(time * 0.4) * 0.03;
  }

  public getObject3D(): THREE.Object3D {
    return this.group;
  }

  public dispose(_ctx?: EngineContext): void {
    this.group.clear();
  }
}
