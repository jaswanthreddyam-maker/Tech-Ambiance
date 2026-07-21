/**
 * MotionEngine is a PURE mathematical library.
 * It has zero knowledge of Three.js objects, DOM elements, or specific UI components.
 */

export interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

export const DEFAULT_SPRING: SpringConfig = {
  stiffness: 120,
  damping: 14,
  mass: 1.0,
};

export class MotionEngine {
  /**
   * Semi-implicit Euler integration for spring physics.
   */
  public static stepSpring(
    current: number,
    target: number,
    velocity: number,
    config: SpringConfig = DEFAULT_SPRING,
    delta: number = 0.016
  ): { position: number; velocity: number } {
    const force = -config.stiffness * (current - target);
    const dampingForce = -config.damping * velocity;
    const acceleration = (force + dampingForce) / config.mass;

    const nextVelocity = velocity + acceleration * delta;
    const nextPosition = current + nextVelocity * delta;

    return { position: nextPosition, velocity: nextVelocity };
  }

  /**
   * Voltage signal propagation math with acceleration & attenuation decay.
   */
  public static stepVoltage(
    currentVoltage: number,
    targetVoltage: number,
    acceleration: number,
    attenuation: number,
    delta: number
  ): number {
    const diff = targetVoltage - currentVoltage;
    const step = diff * acceleration * delta;
    let nextVoltage = (currentVoltage + step) * (1 - attenuation * delta);
    if (Math.abs(nextVoltage) < 0.0001) nextVoltage = 0;
    return nextVoltage;
  }

  /**
   * Linear interpolation.
   */
  public static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor;
  }

  /**
   * Per-node 0.2% organic phase noise offset calculation.
   */
  public static nodePhaseNoise(nodeIdIndex: number, time: number): number {
    const phaseOffset = nodeIdIndex * 0.1618; // Golden ratio multiplier
    return Math.sin(time * 0.8 + phaseOffset) * 0.002;
  }

  /**
   * Micro-breathing oscillation for idle states.
   */
  public static breathingOscillation(time: number, frequency: number = 0.5, amplitude: number = 0.05): number {
    return Math.sin(time * frequency) * amplitude;
  }
}
