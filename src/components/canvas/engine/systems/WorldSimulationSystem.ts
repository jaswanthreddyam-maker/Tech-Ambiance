import * as THREE from 'three';
import { EventBus } from '../EventBus';
import { WindSimulationSystem } from './WindSimulationSystem';
import { EnvironmentTimeline } from './EnvironmentTimeline';
import { QualityManager } from '../services/QualityManager';
import type { WorldState } from '../types/state';

export class WorldSimulationSystem {
  private eventBus: EventBus;
  private windSystem: WindSimulationSystem;
  private timeline: EnvironmentTimeline;
  private qualityManager: QualityManager;

  private state: WorldState;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.windSystem = new WindSimulationSystem(eventBus);
    this.timeline = new EnvironmentTimeline();
    this.qualityManager = QualityManager.getInstance();

    const profile = this.qualityManager.resolveInitialProfile();

    this.state = {
      time: 0,
      deltaTime: 0.016,
      activePhaseIndex: 0,
      phaseProgress: 0,
      wind: this.windSystem.getState(),
      fog: {
        density: 0.02,
        color: new THREE.Color(0x061410),
        near: 5,
        far: 35,
      },
      lighting: {
        keyIntensity: 1.2,
        keyColor: new THREE.Color(0xc5a572),
        keyAngle: new THREE.Vector3(5, 10, 7).normalize(),
        ambientIntensity: 0.7,
        ambientColor: new THREE.Color(0x0a1c15),
        rimIntensity: 0.5,
        exposure: 1.0,
        beamFocus: 1.0,
      },
      camera: {
        position: new THREE.Vector3(0, 0, 10),
        target: new THREE.Vector3(0, 0, 0),
        fov: 45,
        breathingPhase: 0,
      },
      narrative: {
        sectionId: 'hero',
        focusWeight: 1.0,
        lightTarget: new THREE.Vector3(0, 0, 0),
        cardHighlightIntensity: 0,
        backgroundDimming: 0,
      },
      quality: profile,
      qualityName: profile.name,
      scrollProgress: 0,
      scrollVelocity: 0,
      audioActive: false,
      reducedMotion: profile.staticFallback,
    };
  }

  public tick(time: number, delta: number): WorldState {
    this.state.time = time;
    this.state.deltaTime = delta;

    // 1. Tick Wind Simulation
    this.state.wind = this.windSystem.tick(time, delta);

    // 2. Tick Environment Phase Timeline
    const { activePhase, progress } = this.timeline.tick(time);
    this.state.phaseProgress = progress;

    // Smoothly blend lighting exposure & beam intensity towards active phase
    this.state.lighting.exposure = THREE.MathUtils.lerp(
      this.state.lighting.exposure,
      activePhase.exposure,
      delta * 0.5
    );
    this.state.lighting.beamFocus = THREE.MathUtils.lerp(
      this.state.lighting.beamFocus,
      activePhase.goldBeamIntensity,
      delta * 0.5
    );

    // Monitor performance telemetry
    this.qualityManager.tickTelemetry(performance.now());
    this.state.quality = this.qualityManager.getProfile();
    this.state.qualityName = this.state.quality.name;

    this.eventBus.emit('world.simulation.tick', { state: this.state });
    return this.state;
  }

  public getState(): WorldState {
    return this.state;
  }

  public updateScroll(progress: number, velocity: number): void {
    this.state.scrollProgress = progress;
    this.state.scrollVelocity = velocity;
  }

  public setAudioActive(active: boolean): void {
    this.state.audioActive = active;
    this.eventBus.emit('audio.state.changed', { active });
  }
}
