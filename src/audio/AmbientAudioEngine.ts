import type { WorldState } from '../components/canvas/engine/types/state';

export class AmbientAudioEngine {
  private static instance: AmbientAudioEngine | null = null;
  private audioCtx: AudioContext | null = null;

  private isPlaying: boolean = false;

  // Layer Gain Nodes
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private humGain: GainNode | null = null;

  public static getInstance(): AmbientAudioEngine {
    if (!AmbientAudioEngine.instance) {
      AmbientAudioEngine.instance = new AmbientAudioEngine();
    }
    return AmbientAudioEngine.instance;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public start(): void {
    if (this.isPlaying) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime); // Soft atmospheric volume
      this.masterGain.connect(this.audioCtx.destination);

      // Layer 1: Soft Atmospheric Wind Noise (Filtered Pink/White Noise)
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.audioCtx.currentTime);

      this.windGain = this.audioCtx.createGain();
      this.windGain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.windGain);
      this.windGain.connect(this.masterGain);
      whiteNoise.start();

      // Layer 2: Gold Harmonic Resonance Hum (Subtle 108Hz / 216Hz Pure Sines)
      const osc = this.audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(108, this.audioCtx.currentTime);

      this.humGain = this.audioCtx.createGain();
      this.humGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      osc.connect(this.humGain);
      this.humGain.connect(this.masterGain);
      osc.start();

      this.isPlaying = true;
    } catch (e) {
      console.warn('[AmbientAudioEngine] Web Audio failed to start:', e);
    }
  }

  /**
   * Subscribe to WorldState updates to modulate audio layers naturally.
   */
  public updateState(worldState: WorldState): void {
    if (!this.isPlaying || !this.audioCtx || !this.windGain || !this.humGain) return;

    const windSpeed = worldState.wind.speed;
    const exposure = worldState.lighting.exposure;

    // Modulate wind gain slightly with wind simulation speed
    this.windGain.gain.setTargetAtTime(0.05 + windSpeed * 0.04, this.audioCtx.currentTime, 0.5);

    // Modulate gold hum frequency with lighting exposure
    this.humGain.gain.setTargetAtTime(0.03 * exposure, this.audioCtx.currentTime, 0.5);
  }

  public stop(): void {
    if (!this.isPlaying || !this.audioCtx) return;

    if (this.masterGain) {
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
    }

    setTimeout(() => {
      this.audioCtx?.close();
      this.audioCtx = null;
      this.isPlaying = false;
    }, 500);
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}
