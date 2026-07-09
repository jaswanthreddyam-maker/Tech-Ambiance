import type { Variants } from "framer-motion";
import { motion as motionTheme } from "../../design-system/motion";

export const zoomIn: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: motionTheme.durations.medium,
      ease: motionTheme.easings.premium,
    },
  },
};

export const zoomOut: Variants = {
  hidden: { scale: 1.05, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: motionTheme.durations.medium,
      ease: motionTheme.easings.premium,
    },
  },
};
