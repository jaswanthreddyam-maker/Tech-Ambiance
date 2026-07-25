import type { NarrativeState, QualityProfile } from './types';

export type EventDomain = 'interaction' | 'narrative' | 'performance' | 'render' | 'asset';

export interface EventMap {
  // Interaction domain
  'interaction.pointer': { x: number; y: number; normalizedX: number; normalizedY: number };
  'interaction.scroll': { offset: number; velocity: number };
  'interaction.hover': { targetId: string; active: boolean };
  'interaction.focus': { elementId: string };

  // Narrative domain
  'narrative.chapter': { state: NarrativeState; previousState: NarrativeState };
  'narrative.memory': { visitedChapters: NarrativeState[] };
  'narrative.idle': { durationSeconds: number; selfAssemblyActive: boolean };

  // Performance domain
  'performance.profile': { profile: QualityProfile };
  'performance.pause': { isPaused: boolean; reason: string };
  'performance.contextLost': void;
  'performance.contextRestored': void;

  // Render domain
  'render.tick': { time: number; delta: number; scrollVelocity: number };
  'render.resize': { width: number; height: number; dpr: number };

  // Asset domain
  'asset.loaded': { assetId: string };
  'asset.disposed': { assetId: string };
}

type EventCallback<T> = (data: T) => void;

export class EventBus {
  private listeners: Map<keyof EventMap, Set<EventCallback<any>>> = new Map();

  public on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const eventSet = this.listeners.get(event)!;
    eventSet.add(callback);

    // Return cleanup function
    return () => {
      eventSet.delete(callback);
    };
  }

  public off<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.delete(callback);
    }
  }

  public emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const eventSet = this.listeners.get(event);
    if (eventSet) {
      eventSet.forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event "${String(event)}":`, err);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}
