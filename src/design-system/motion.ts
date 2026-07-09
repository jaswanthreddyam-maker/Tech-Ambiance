export const motion = {
  durations: {
    hover: 0.15,
    button: 0.2,
    card: 0.35,
    medium: 0.5,
    large: 0.8,
  },
  easings: {
    // Elegant cubic bezier transition styles (Apple / Stripe inspired)
    smooth: [0.25, 0.1, 0.25, 1],
    premium: [0.16, 1, 0.3, 1], // Custom easeOutExpo
    gentle: [0.43, 0.13, 0.23, 0.96],
  },
} as const;

export type MotionDS = typeof motion;
