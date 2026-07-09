import { motion as motionTheme } from "../../design-system/motion";

export const transitions = {
  hover: {
    duration: motionTheme.durations.hover,
    ease: motionTheme.easings.smooth,
  },
  button: {
    duration: motionTheme.durations.button,
    ease: motionTheme.easings.smooth,
  },
  card: {
    duration: motionTheme.durations.card,
    ease: motionTheme.easings.premium,
  },
  medium: {
    duration: motionTheme.durations.medium,
    ease: motionTheme.easings.premium,
  },
  large: {
    duration: motionTheme.durations.large,
    ease: motionTheme.easings.gentle,
  },
} as const;
