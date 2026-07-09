export const spacing = {
  xs: "0.25rem",   // 4px
  sm: "0.5rem",    // 8px
  md: "1rem",      // 16px
  lg: "1.5rem",    // 24px
  xl: "2rem",      // 32px
  xxl: "3rem",     // 48px
  huge: "4rem",    // 64px
  giant: "6rem",   // 96px
  colGap: "2rem",
  rowGap: "2rem",
} as const;

export type Spacing = typeof spacing;
