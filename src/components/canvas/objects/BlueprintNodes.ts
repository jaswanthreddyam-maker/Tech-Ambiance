import * as THREE from 'three';
import type { SceneObjectContract } from '../engine/SceneRegistry';
import type { EngineContext } from '../engine/types';
import { NarrativeState } from '../engine/types';

interface NodeData {
  basePos: THREE.Vector3;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  velocity: THREE.Vector3;
  scale: number;
  clusterId: number;
}

interface EdgeData {
  fromIndex: number;
  toIndex: number;
  progress: number; // 0 to 1 for line drawing
}

import { voltageVertexShader, voltageFragmentShader } from '../shaders/voltageShader';

export class BlueprintNodes implements SceneObjectContract {
  public readonly id = 'blueprint-nodes';

  private group: THREE.Group = new THREE.Group();
  private nodeMesh: THREE.InstancedMesh | null = null;
  private lineSegments: THREE.LineSegments | null = null;
  private lineGeometry: THREE.BufferGeometry | null = null;
  private lineMaterial: THREE.ShaderMaterial | null = null;
  private nodeMaterial: THREE.MeshBasicMaterial | null = null;

  private nodes: NodeData[] = [];
  private edges: EdgeData[] = [];

  private _currentChapter: NarrativeState = NarrativeState.Awakening;
  private selfAssemblyActive: boolean = false;
  private assemblyProgress: number = 0; // 0 to 1

  public getCurrentChapter(): NarrativeState {
    return this._currentChapter;
  }

  private unsubBusCallbacks: (() => void)[] = [];

  public initialize(ctx: EngineContext): void {
    // 1. Build initial mathematical seed nodes (12 nodes)
    this.nodes = [
      // Hero Seed Nodes (Cluster 0)
      { basePos: new THREE.Vector3(-3.5, 2.0, 0), currentPos: new THREE.Vector3(-3.5, 2.0, 0), targetPos: new THREE.Vector3(-3.5, 2.0, 0), velocity: new THREE.Vector3(), scale: 0.15, clusterId: 0 },
      { basePos: new THREE.Vector3(-1.5, 2.8, 0.5), currentPos: new THREE.Vector3(-1.5, 2.8, 0.5), targetPos: new THREE.Vector3(-1.5, 2.8, 0.5), velocity: new THREE.Vector3(), scale: 0.12, clusterId: 0 },
      { basePos: new THREE.Vector3(-2.2, 0.5, -0.5), currentPos: new THREE.Vector3(-2.2, 0.5, -0.5), targetPos: new THREE.Vector3(-2.2, 0.5, -0.5), velocity: new THREE.Vector3(), scale: 0.14, clusterId: 0 },
      { basePos: new THREE.Vector3(-0.5, 1.2, 0.2), currentPos: new THREE.Vector3(-0.5, 1.2, 0.2), targetPos: new THREE.Vector3(-0.5, 1.2, 0.2), velocity: new THREE.Vector3(), scale: 0.16, clusterId: 0 },

      // Right Showcase Nodes (Cluster 1)
      { basePos: new THREE.Vector3(2.5, 2.2, -0.2), currentPos: new THREE.Vector3(2.5, 2.2, -0.2), targetPos: new THREE.Vector3(2.5, 2.2, -0.2), velocity: new THREE.Vector3(), scale: 0.18, clusterId: 1 },
      { basePos: new THREE.Vector3(4.0, 1.0, 0.4), currentPos: new THREE.Vector3(4.0, 1.0, 0.4), targetPos: new THREE.Vector3(4.0, 1.0, 0.4), velocity: new THREE.Vector3(), scale: 0.13, clusterId: 1 },
      { basePos: new THREE.Vector3(1.8, 0.2, -0.4), currentPos: new THREE.Vector3(1.8, 0.2, -0.4), targetPos: new THREE.Vector3(1.8, 0.2, -0.4), velocity: new THREE.Vector3(), scale: 0.15, clusterId: 1 },

      // Lower Section Connectivity (Cluster 2)
      { basePos: new THREE.Vector3(-3.0, -1.8, 0), currentPos: new THREE.Vector3(-3.0, -1.8, 0), targetPos: new THREE.Vector3(-3.0, -1.8, 0), velocity: new THREE.Vector3(), scale: 0.14, clusterId: 2 },
      { basePos: new THREE.Vector3(-1.0, -2.5, 0.3), currentPos: new THREE.Vector3(-1.0, -2.5, 0.3), targetPos: new THREE.Vector3(-1.0, -2.5, 0.3), velocity: new THREE.Vector3(), scale: 0.12, clusterId: 2 },
      { basePos: new THREE.Vector3(1.2, -2.0, -0.3), currentPos: new THREE.Vector3(1.2, -2.0, -0.3), targetPos: new THREE.Vector3(1.2, -2.0, -0.3), velocity: new THREE.Vector3(), scale: 0.15, clusterId: 2 },
      { basePos: new THREE.Vector3(3.2, -2.4, 0.1), currentPos: new THREE.Vector3(3.2, -2.4, 0.1), targetPos: new THREE.Vector3(3.2, -2.4, 0.1), velocity: new THREE.Vector3(), scale: 0.13, clusterId: 2 },
      { basePos: new THREE.Vector3(0.0, -3.5, 0.0), currentPos: new THREE.Vector3(0.0, -3.5, 0.0), targetPos: new THREE.Vector3(0.0, -3.5, 0.0), velocity: new THREE.Vector3(), scale: 0.20, clusterId: 2 },
    ];

    // Define edges between seed nodes
    this.edges = [
      { fromIndex: 0, toIndex: 1, progress: 0 },
      { fromIndex: 1, toIndex: 3, progress: 0 },
      { fromIndex: 0, toIndex: 2, progress: 0 },
      { fromIndex: 2, toIndex: 3, progress: 0 },
      { fromIndex: 3, toIndex: 4, progress: 0 },
      { fromIndex: 4, toIndex: 5, progress: 0 },
      { fromIndex: 4, toIndex: 6, progress: 0 },
      { fromIndex: 2, toIndex: 7, progress: 0 },
      { fromIndex: 7, toIndex: 8, progress: 0 },
      { fromIndex: 8, toIndex: 9, progress: 0 },
      { fromIndex: 9, toIndex: 10, progress: 0 },
      { fromIndex: 9, toIndex: 11, progress: 0 },
      { fromIndex: 10, toIndex: 11, progress: 0 },
    ];

    // 2. Create InstancedMesh for Nodes (Emerald Green)
    const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    this.nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x0b3027 });
    this.nodeMesh = new THREE.InstancedMesh(sphereGeo, this.nodeMaterial, this.nodes.length);
    this.group.add(this.nodeMesh);

    // 3. Create LineSegments with GLSL Voltage Shader
    this.lineGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.edges.length * 6);
    const progressAttr = new Float32Array(this.edges.length * 2);

    for (let i = 0; i < this.edges.length; i++) {
      progressAttr[i * 2] = 0.0;
      progressAttr[i * 2 + 1] = 1.0;
    }

    this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.lineGeometry.setAttribute('aProgress', new THREE.BufferAttribute(progressAttr, 1));

    this.lineMaterial = new THREE.ShaderMaterial({
      vertexShader: voltageVertexShader,
      fragmentShader: voltageFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xc9a56a) },
        uVoltagePulse: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });

    this.lineSegments = new THREE.LineSegments(this.lineGeometry, this.lineMaterial);
    this.group.add(this.lineSegments);

    // 4. Listen to EventBus for chapter transitions & idle self-assembly
    const bus = ctx.scene ? (ctx as any).eventBus : null;
    if (bus) {
      this.unsubBusCallbacks.push(
        bus.on('narrative.chapter', ({ state }: { state: NarrativeState }) => {
          this._currentChapter = state;
          this.updateChapterPositions(state);
        }),
        bus.on('narrative.idle', ({ selfAssemblyActive }: { selfAssemblyActive: boolean }) => {
          this.selfAssemblyActive = selfAssemblyActive;
        })
      );
    }
  }

  public update(ctx: EngineContext, delta: number): void {
    if (!this.nodeMesh || !this.lineGeometry) return;

    // 1. Advance linear assembly progress (Awakening animation)
    if (this.assemblyProgress < 1.0) {
      this.assemblyProgress = Math.min(1.0, this.assemblyProgress + delta * 0.8);
    }

    const time = performance.now() / 1000;
    if (this.lineMaterial) {
      this.lineMaterial.uniforms.uTime.value = time;
    }
    const dummy = new THREE.Object3D();

    // 2. Update Node Positions with spring inertia & 0.2% organic phase noise
    this.nodes.forEach((node, i) => {
      // Spring lerp target position
      node.currentPos.lerp(node.targetPos, delta * 3.5);

      // Add subtle organic micro-breathing & phase noise
      const noiseX = Math.sin(time * 0.8 + i * 0.5) * 0.04;
      const noiseY = Math.cos(time * 0.7 + i * 0.6) * 0.04;

      // Mouse proximity interaction shift
      const mouseShiftX = ctx.interactionState.normalizedX * 0.3 * (node.clusterId === 0 ? 1 : 0.5);
      const mouseShiftY = ctx.interactionState.normalizedY * 0.3 * (node.clusterId === 0 ? 1 : 0.5);

      dummy.position.set(
        node.currentPos.x + noiseX + mouseShiftX,
        node.currentPos.y + noiseY + mouseShiftY,
        node.currentPos.z
      );

      // Dynamic scale
      const scaleMultiplier = this.selfAssemblyActive ? 1.2 : 1.0;
      const currentScale = node.scale * this.assemblyProgress * scaleMultiplier;
      dummy.scale.set(currentScale, currentScale, currentScale);

      dummy.updateMatrix();
      this.nodeMesh!.setMatrixAt(i, dummy.matrix);
    });

    this.nodeMesh.instanceMatrix.needsUpdate = true;

    // 3. Update Line Filaments Geometry
    const posAttr = this.lineGeometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    this.edges.forEach((edge, i) => {
      const fromNode = this.nodes[edge.fromIndex];
      const toNode = this.nodes[edge.toIndex];

      const edgeProgress = Math.min(1.0, this.assemblyProgress * 1.5);

      // Animated drawing from start to target
      const endX = THREE.MathUtils.lerp(fromNode.currentPos.x, toNode.currentPos.x, edgeProgress);
      const endY = THREE.MathUtils.lerp(fromNode.currentPos.y, toNode.currentPos.y, edgeProgress);
      const endZ = THREE.MathUtils.lerp(fromNode.currentPos.z, toNode.currentPos.z, edgeProgress);

      const idx = i * 6;
      posArray[idx] = fromNode.currentPos.x;
      posArray[idx + 1] = fromNode.currentPos.y;
      posArray[idx + 2] = fromNode.currentPos.z;

      posArray[idx + 3] = endX;
      posArray[idx + 4] = endY;
      posArray[idx + 5] = endZ;
    });

    posAttr.needsUpdate = true;
  }

  private updateChapterPositions(state: NarrativeState): void {
    // Exaggerated Topological Structure per Chapter
    switch (state) {
      case NarrativeState.Awakening:
        // Sparse Seed Nodes (Minimal 3-point orientation)
        this.nodes.forEach((n, i) => {
          if (i < 4) {
            n.targetPos.copy(n.basePos);
          } else {
            n.targetPos.set(n.basePos.x * 0.2, n.basePos.y * 0.2, 0);
          }
        });
        break;

      case NarrativeState.Expansion:
        // Branching Tree Topology
        this.nodes.forEach((n, i) => {
          const depth = Math.floor(i / 3);
          const col = (i % 3) - 1;
          n.targetPos.set(col * 2.2 + depth * 0.8, (2 - depth) * 1.5 - 1.0, depth * 0.2);
        });
        break;

      case NarrativeState.Capability:
        // 4 Modular Quad Clusters (UI/UX, Systems, Telemetry, Cloud)
        this.nodes.forEach((n, i) => {
          const cluster = i % 4;
          const corner = Math.floor(i / 4);
          const cx = (cluster % 2 === 0 ? -1 : 1) * 2.8;
          const cy = (cluster < 2 ? 1 : -1) * 1.8;
          const ox = (corner % 2 === 0 ? -0.5 : 0.5);
          const oy = (corner < 2 ? 0.5 : -0.5);
          n.targetPos.set(cx + ox, cy + oy, 0);
        });
        break;

      case NarrativeState.Execution:
        // Directed Linear Pipeline (Left to Right)
        this.nodes.forEach((n, i) => {
          n.targetPos.set((i - 5.5) * 0.65, Math.sin(i * 0.8) * 0.4, 0);
        });
        break;

      case NarrativeState.Proof:
        // Rigid Architectural Lattice Matrix (3x4 Grid)
        this.nodes.forEach((n, i) => {
          const col = (i % 4) - 1.5;
          const row = Math.floor(i / 4) - 1;
          n.targetPos.set(col * 2.0, row * 1.4, 0);
        });
        break;

      case NarrativeState.Convergence:
        // Radial Star Topology (All converging to bottom CTA)
        this.nodes.forEach((n, i) => {
          const angle = (i / this.nodes.length) * Math.PI * 2;
          const radius = i === 11 ? 0 : 3.0; // Central target node
          n.targetPos.set(Math.cos(angle) * radius, -2.5 + Math.sin(angle) * (radius * 0.6), 0);
        });
        break;
    }
  }

  public getObject3D(): THREE.Object3D {
    return this.group;
  }

  public dispose(_ctx?: EngineContext): void {
    this.unsubBusCallbacks.forEach((unsub) => unsub());
    this.unsubBusCallbacks = [];

    if (this.nodeMaterial) this.nodeMaterial.dispose();
    if (this.lineMaterial) this.lineMaterial.dispose();
    if (this.lineGeometry) this.lineGeometry.dispose();
    if (this.nodeMesh) {
      this.nodeMesh.geometry.dispose();
      this.group.remove(this.nodeMesh);
    }
    if (this.lineSegments) {
      this.group.remove(this.lineSegments);
    }
  }
}
