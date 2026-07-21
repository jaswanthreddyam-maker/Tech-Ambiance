import type { QualityProfile, QualityProfileName } from './types';
import { EventBus } from './EventBus';

export const QUALITY_PROFILES: Record<QualityProfileName, QualityProfile> = {
  Ultra: {
    name: 'Ultra',
    maxDpr: 1.5,
    maxVertices: 15000,
    maxDrawCalls: 12,
    fpsCap: 60,
    enableShaders: true,
    enableNoise: true,
    staticFallback: false,
  },
  High: {
    name: 'High',
    maxDpr: 1.25,
    maxVertices: 10000,
    maxDrawCalls: 10,
    fpsCap: 60,
    enableShaders: true,
    enableNoise: true,
    staticFallback: false,
  },
  Balanced: {
    name: 'Balanced',
    maxDpr: 1.0,
    maxVertices: 5000,
    maxDrawCalls: 8,
    fpsCap: 60,
    enableShaders: true,
    enableNoise: false,
    staticFallback: false,
  },
  Low: {
    name: 'Low',
    maxDpr: 1.0,
    maxVertices: 2000,
    maxDrawCalls: 5,
    fpsCap: 30,
    enableShaders: false,
    enableNoise: false,
    staticFallback: false,
  },
  Minimal: {
    name: 'Minimal',
    maxDpr: 1.0,
    maxVertices: 0,
    maxDrawCalls: 0,
    fpsCap: 0,
    enableShaders: false,
    enableNoise: false,
    staticFallback: true,
  },
};

export class PerformanceEngine {
  private eventBus: EventBus;
  private currentProfile: QualityProfile;
  private isReducedMotion: boolean = false;
  private intersectionObserver: IntersectionObserver | null = null;
  private isVisible: boolean = true;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.isReducedMotion = this.checkReducedMotion();
    this.currentProfile = this.resolveProfile();
  }

  public boot(container: HTMLElement): void {
    // Notify bus of initial profile
    this.eventBus.emit('performance.profile', { profile: this.currentProfile });

    // Setup reduced motion media query listener
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (e: MediaQueryListEvent) => {
        this.isReducedMotion = e.matches;
        this.currentProfile = this.resolveProfile();
        this.eventBus.emit('performance.profile', { profile: this.currentProfile });
      };
      mediaQuery.addEventListener?.('change', handleChange);
    }

    // Setup IntersectionObserver for offscreen pause
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const visible = entry.isIntersecting;
          if (this.isVisible !== visible) {
            this.isVisible = visible;
            this.eventBus.emit('performance.pause', {
              isPaused: !visible,
              reason: visible ? 'viewport_enter' : 'viewport_exit',
            });
          }
        },
        { threshold: 0.05 }
      );
      this.intersectionObserver.observe(container);
    }
  }

  public getProfile(): QualityProfile {
    return this.currentProfile;
  }

  public checkIsReducedMotion(): boolean {
    return this.isReducedMotion;
  }

  public checkIsVisible(): boolean {
    return this.isVisible;
  }

  private checkReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private resolveProfile(): QualityProfile {
    if (this.isReducedMotion) {
      return QUALITY_PROFILES.Minimal;
    }

    if (typeof navigator === 'undefined') return QUALITY_PROFILES.Balanced;

    const cores = navigator.hardwareConcurrency || 4;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    // Mobile / Low hardware tier
    if (cores <= 2 || maxTouchPoints > 2) {
      return QUALITY_PROFILES.Low;
    }

    // High-end desktop
    if (cores >= 8) {
      return QUALITY_PROFILES.Ultra;
    }

    if (cores >= 4) {
      return QUALITY_PROFILES.High;
    }

    return QUALITY_PROFILES.Balanced;
  }

  public destroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }
}
