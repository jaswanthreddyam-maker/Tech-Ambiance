import { fadeIn, fadeInSlow } from "./variants/fade";
import { slideUp, slideDown, slideRight } from "./variants/slide";
import { blurReveal } from "./variants/blur";
import { zoomIn, zoomOut } from "./variants/zoom";
import { staggerContainer } from "./variants/stagger";
import { transitions } from "./transitions";

export const motionVariants = {
  fadeIn,
  fadeInSlow,
  slideUp,
  slideDown,
  slideRight,
  blurReveal,
  zoomIn,
  zoomOut,
  staggerContainer,
} as const;

export { transitions };
