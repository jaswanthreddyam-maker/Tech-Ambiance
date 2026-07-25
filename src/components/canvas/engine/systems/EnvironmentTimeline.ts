import * as THREE from 'three';
import type { EnvironmentPhase } from '../types/state';

export const ENVIRONMENT_PHASES: EnvironmentPhase[] = [
  {
    id: 'phase-1',
    name: 'Morning Architectural Clarity',
    duration: 60, // 60 seconds
    cloudDensity: 0.15,
    lightAngle: new THREE.Vector3(5, 10, 7).normalize(),
    exposure: 1.0,
    windStrength: 0.25,
    dustDensity: 0.3,
    goldBeamIntensity: 1.0,
  },
  {
    id: 'phase-2',
    name: 'Volumetric Cloud Atmosphere',
    duration: 90,
    cloudDensity: 0.35,
    lightAngle: new THREE.Vector3(3, 12, 6).normalize(),
    exposure: 0.95,
    windStrength: 0.45,
    dustDensity: 0.5,
    goldBeamIntensity: 1.25,
  },
  {
    id: 'phase-3',
    name: 'Illuminated Dust & Solar Shimmer',
    duration: 90,
    cloudDensity: 0.25,
    lightAngle: new THREE.Vector3(7, 8, 8).normalize(),
    exposure: 1.1,
    windStrength: 0.35,
    dustDensity: 0.8,
    goldBeamIntensity: 1.5,
  },
  {
    id: 'phase-4',
    name: 'Golden Monolith Zenith',
    duration: 120,
    cloudDensity: 0.2,
    lightAngle: new THREE.Vector3(0, 15, 5).normalize(),
    exposure: 1.05,
    windStrength: 0.3,
    dustDensity: 0.6,
    goldBeamIntensity: 1.6,
  },
];

export class EnvironmentTimeline {
  private activePhaseIndex: number = 0;
  private phaseStartTime: number = 0;

  public tick(time: number): { activePhase: EnvironmentPhase; progress: number } {
    if (this.phaseStartTime === 0) {
      this.phaseStartTime = time;
    }

    const currentPhase = ENVIRONMENT_PHASES[this.activePhaseIndex];
    const elapsed = time - this.phaseStartTime;
    const progress = Math.min(1.0, elapsed / currentPhase.duration);

    if (progress >= 1.0) {
      this.activePhaseIndex = (this.activePhaseIndex + 1) % ENVIRONMENT_PHASES.length;
      this.phaseStartTime = time;
    }

    return {
      activePhase: currentPhase,
      progress,
    };
  }

  public getActivePhase(): EnvironmentPhase {
    return ENVIRONMENT_PHASES[this.activePhaseIndex];
  }
}
