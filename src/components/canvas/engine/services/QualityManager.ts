import type { QualityProfile, QualityProfileName } from '../types';
import { QUALITY_PROFILES } from '../PerformanceEngine';

export class QualityManager {
  private static instance: QualityManager | null = null;
  private activeProfile: QualityProfile = QUALITY_PROFILES.High;
  private frameTimes: number[] = [];
  private lastTime: number = performance.now();

  public static getInstance(): QualityManager {
    if (!QualityManager.instance) {
      QualityManager.instance = new QualityManager();
    }
    return QualityManager.instance;
  }

  public resolveInitialProfile(): QualityProfile {
    if (typeof window === 'undefined') return QUALITY_PROFILES.Balanced;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.activeProfile = QUALITY_PROFILES.Minimal;
      return this.activeProfile;
    }

    const cores = navigator.hardwareConcurrency || 4;
    const maxTouchPoints = navigator.maxTouchPoints || 0;

    if (cores <= 2 || maxTouchPoints > 2) {
      this.activeProfile = QUALITY_PROFILES.Low;
    } else if (cores >= 8) {
      this.activeProfile = QUALITY_PROFILES.Ultra;
    } else if (cores >= 4) {
      this.activeProfile = QUALITY_PROFILES.High;
    } else {
      this.activeProfile = QUALITY_PROFILES.Balanced;
    }

    return this.activeProfile;
  }

  public getProfile(): QualityProfile {
    return this.activeProfile;
  }

  public setProfile(name: QualityProfileName): QualityProfile {
    this.activeProfile = QUALITY_PROFILES[name];
    return this.activeProfile;
  }

  /**
   * Monitor FPS telemetry to auto-degrade profile if needed.
   */
  public tickTelemetry(time: number): void {
    const delta = time - this.lastTime;
    this.lastTime = time;

    if (delta > 0 && delta < 500) {
      this.frameTimes.push(delta);
      if (this.frameTimes.length > 60) {
        this.frameTimes.shift();

        const avgDelta = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        const fps = 1000 / avgDelta;

        // Auto-degrade if sustained FPS < 35
        if (fps < 35 && this.activeProfile.name === 'Ultra') {
          this.setProfile('High');
        } else if (fps < 30 && this.activeProfile.name === 'High') {
          this.setProfile('Balanced');
        } else if (fps < 25 && this.activeProfile.name === 'Balanced') {
          this.setProfile('Low');
        }
      }
    }
  }
}
