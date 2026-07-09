import { colors } from "./colors";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { typography } from "./typography";
import { motion } from "./motion";
import { shadows } from "./shadows";
import { breakpoints } from "./breakpoints";
import { zIndex } from "./zIndex";

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  motion,
  shadows,
  breakpoints,
  zIndex,
} as const;

export type Theme = typeof theme;

export { colors, spacing, radius, typography, motion, shadows, breakpoints, zIndex };
