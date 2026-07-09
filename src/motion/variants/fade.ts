import type { Variants } from "framer-motion";
import { motion as motionTheme } from "../../design-system/motion";

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTheme.durations.medium,
      ease: motionTheme.easings.smooth,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: motionTheme.durations.hover,
      ease: motionTheme.easings.smooth,
    },
  },
};

export const fadeInSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTheme.durations.large,
      ease: motionTheme.easings.gentle,
    },
  },
};
