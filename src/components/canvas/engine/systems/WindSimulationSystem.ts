import * as THREE from 'three';
import { EventBus } from '../EventBus';
import type { WindState } from '../types/state';

export class WindSimulationSystem {
  private eventBus: EventBus;
  private state: WindState = {
    speed: 0.35,
    direction: new THREE.Vector3(1, 0.1, 0.2).normalize(),
    gust: 0,
    turbulence: 0.12,
  };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public tick(time: number, _delta: number): WindState {
    // Soft organic gust cycle using sine waves
    const gustBase = Math.sin(time * 0.2) * 0.15 + Math.cos(time * 0.07) * 0.1;
    this.state.gust = Math.max(0, gustBase);
    this.state.speed = 0.35 + this.state.gust;

    // Organic direction wobble
    this.state.direction.x = 1.0 + Math.sin(time * 0.15) * 0.15;
    this.state.direction.y = 0.1 + Math.cos(time * 0.12) * 0.08;
    this.state.direction.z = 0.2 + Math.sin(time * 0.08) * 0.1;
    this.state.direction.normalize();

    this.eventBus.emit('wind.updated', { ...this.state });
    return this.state;
  }

  public getState(): WindState {
    return { ...this.state };
  }
}
