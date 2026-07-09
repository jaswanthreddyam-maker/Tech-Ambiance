import type { Variants } from "framer-motion";
import { motion as motionTheme } from "../../design-system/motion";

export const blurReveal: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: {
    filter: "blur(0px)",
    opacity: 1,
    transition: {
      duration: motionTheme.durations.large,
      ease: motionTheme.easings.premium,
    },
  },
};
