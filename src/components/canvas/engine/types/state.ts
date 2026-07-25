import type * as THREE from 'three';
import type { QualityProfile, QualityProfileName } from '../types';

export interface WindState {
  speed: number;
  direction: THREE.Vector3;
  gust: number;
  turbulence: number;
}

export interface FogState {
  density: number;
  color: THREE.Color;
  near: number;
  far: number;
}

export interface LightingState {
  keyIntensity: number;
  keyColor: THREE.Color;
  keyAngle: THREE.Vector3;
  ambientIntensity: number;
  ambientColor: THREE.Color;
  rimIntensity: number;
  exposure: number;
  beamFocus: number;
}

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  breathingPhase: number;
}

export interface NarrativeFocusState {
  sectionId: string;
  focusWeight: number;
  lightTarget: THREE.Vector3;
  cardHighlightIntensity: number;
  backgroundDimming: number;
}

export interface EnvironmentPhase {
  id: string;
  name: string;
  duration: number;
  cloudDensity: number;
  lightAngle: THREE.Vector3;
  exposure: number;
  windStrength: number;
  dustDensity: number;
  goldBeamIntensity: number;
}

export interface WorldState {
  time: number;
  deltaTime: number;
  activePhaseIndex: number;
  phaseProgress: number;
  wind: WindState;
  fog: FogState;
  lighting: LightingState;
  camera: CameraState;
  narrative: NarrativeFocusState;
  quality: QualityProfile;
  qualityName: QualityProfileName;
  scrollProgress: number;
  scrollVelocity: number;
  audioActive: boolean;
  reducedMotion: boolean;
}
