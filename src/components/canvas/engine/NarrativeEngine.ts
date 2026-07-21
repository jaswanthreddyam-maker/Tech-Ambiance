import { NarrativeState } from './types';
import { EventBus } from './EventBus';

export class NarrativeEngine {
  private eventBus: EventBus;
  private currentState: NarrativeState = NarrativeState.Awakening;
  private visitedChapters: Set<NarrativeState> = new Set([NarrativeState.Awakening]);
  private idleTimer: any = null;
  private lastActivityTime: number = Date.now();
  private selfAssemblyActive: boolean = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  public boot(): void {
    // Listen for scroll and pointer events to reset idle self-assembly timer
    this.eventBus.on('interaction.pointer', () => this.resetIdleTimer());
    this.eventBus.on('interaction.scroll', () => this.resetIdleTimer());

    this.startIdleChecker();
  }

  public getState(): NarrativeState {
    return this.currentState;
  }

  public getVisitedChapters(): Set<NarrativeState> {
    return new Set(this.visitedChapters);
  }

  public transitionTo(nextState: NarrativeState): void {
    if (this.currentState === nextState) return;

    const previousState = this.currentState;
    this.currentState = nextState;
    this.visitedChapters.add(nextState);

    this.eventBus.emit('narrative.chapter', {
      state: this.currentState,
      previousState,
    });

    this.eventBus.emit('narrative.memory', {
      visitedChapters: Array.from(this.visitedChapters),
    });
  }

  private resetIdleTimer(): void {
    this.lastActivityTime = Date.now();
    if (this.selfAssemblyActive) {
      this.selfAssemblyActive = false;
      this.eventBus.emit('narrative.idle', {
        durationSeconds: 0,
        selfAssemblyActive: false,
      });
    }
  }

  private startIdleChecker(): void {
    if (typeof window === 'undefined') return;

    this.idleTimer = setInterval(() => {
      const idleDuration = (Date.now() - this.lastActivityTime) / 1000;
      if (idleDuration >= 20 && !this.selfAssemblyActive) {
        this.selfAssemblyActive = true;
        this.eventBus.emit('narrative.idle', {
          durationSeconds: idleDuration,
          selfAssemblyActive: true,
        });
      }
    }, 1000);
  }

  public destroy(): void {
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }
}
