import type * as THREE from 'three';

export const NarrativeState = {
  Awakening: 'Awakening',
  Expansion: 'Expansion',
  Capability: 'Capability',
  Execution: 'Execution',
  Proof: 'Proof',
  Convergence: 'Convergence',
} as const;

export type NarrativeState = typeof NarrativeState[keyof typeof NarrativeState];

export type QualityProfileName = 'Ultra' | 'High' | 'Balanced' | 'Low' | 'Minimal';

export interface QualityProfile {
  name: QualityProfileName;
  maxDpr: number;
  maxVertices: number;
  maxDrawCalls: number;
  fpsCap: number;
  enableShaders: boolean;
  enableNoise: boolean;
  staticFallback: boolean;
}

export interface ViewportSize {
  width: number;
  height: number;
  aspect: number;
  dpr: number;
}

export interface InteractionState {
  mouseX: number;
  mouseY: number;
  pointerActive: boolean;
  normalizedX: number; // -1 to 1
  normalizedY: number; // -1 to 1
  scrollOffset: number;
  scrollVelocity: number;
}

export interface EngineContext {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  scene: THREE.Scene | null;
  viewport: ViewportSize;
  interactionState: InteractionState;
  narrativeState: NarrativeState;
  visitedChapters: Set<NarrativeState>;
  qualityProfile: QualityProfile;
  isPaused: boolean;
  isReducedMotion: boolean;
}
