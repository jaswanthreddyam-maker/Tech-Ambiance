import * as THREE from 'three';
import { EventBus } from '../EventBus';
import type { WorldState } from '../types/state';

export interface SectionBreakpoint {
  id: string;
  scrollStart: number;
  scrollEnd: number;
  lightTarget: THREE.Vector3;
  cameraOffset: THREE.Vector3;
  cardHighlightIntensity: number;
  backgroundDimming: number;
}

export class NarrativeSystem {
  private eventBus: EventBus;
  private currentSectionId: string = 'hero';

  // Section Focus Breakpoints
  private breakpoints: SectionBreakpoint[] = [
    {
      id: 'hero',
      scrollStart: 0,
      scrollEnd: 0.25,
      lightTarget: new THREE.Vector3(0, 0, 0),
      cameraOffset: new THREE.Vector3(0, 0, 10),
      cardHighlightIntensity: 0.2,
      backgroundDimming: 0.0,
    },
    {
      id: 'work',
      scrollStart: 0.25,
      scrollEnd: 0.55,
      lightTarget: new THREE.Vector3(2.5, -1, 1),
      cameraOffset: new THREE.Vector3(0.5, -0.5, 9.5),
      cardHighlightIntensity: 0.8,
      backgroundDimming: 0.15,
    },
    {
      id: 'services',
      scrollStart: 0.55,
      scrollEnd: 0.8,
      lightTarget: new THREE.Vector3(-2, -2.5, 1.5),
      cameraOffset: new THREE.Vector3(-0.8, -1.2, 9.0),
      cardHighlightIntensity: 1.0,
      backgroundDimming: 0.25,
    },
    {
      id: 'process',
      scrollStart: 0.8,
      scrollEnd: 1.0,
      lightTarget: new THREE.Vector3(0, -4, 0),
      cameraOffset: new THREE.Vector3(0, -2.0, 8.5),
      cardHighlightIntensity: 0.6,
      backgroundDimming: 0.1,
    },
  ];

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public tick(worldState: WorldState, delta: number): void {
    const scroll = worldState.scrollProgress;

    // Find active section breakpoint based on scroll ratio
    const activeBp = this.breakpoints.find(bp => scroll >= bp.scrollStart && scroll <= bp.scrollEnd) || this.breakpoints[0];

    if (this.currentSectionId !== activeBp.id) {
      this.currentSectionId = activeBp.id;
      this.eventBus.emit('narrative.focus.changed', {
        sectionId: activeBp.id,
        breakpoint: activeBp,
      });
    }

    // Interpolate narrative focus targets in WorldState
    worldState.narrative.sectionId = activeBp.id;
    worldState.narrative.cardHighlightIntensity = THREE.MathUtils.lerp(
      worldState.narrative.cardHighlightIntensity,
      activeBp.cardHighlightIntensity,
      delta * 3.0
    );
    worldState.narrative.backgroundDimming = THREE.MathUtils.lerp(
      worldState.narrative.backgroundDimming,
      activeBp.backgroundDimming,
      delta * 3.0
    );
    worldState.narrative.lightTarget.lerp(activeBp.lightTarget, delta * 2.5);
  }

  public registerSectionBreakpoints(breakpoints: SectionBreakpoint[]): void {
    this.breakpoints = breakpoints;
  }
}
