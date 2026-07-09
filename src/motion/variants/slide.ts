import type { Variants } from "framer-motion";
import { motion as motionTheme } from "../../design-system/motion";

export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: motionTheme.durations.medium,
      ease: motionTheme.easings.premium,
    },
  },
};

export const slideDown: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: motionTheme.durations.medium,
      ease: motionTheme.easings.premium,
    },
  },
};

export const slideRight: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: motionTheme.durations.medium,
      ease: motionTheme.easings.premium,
    },
  },
};
