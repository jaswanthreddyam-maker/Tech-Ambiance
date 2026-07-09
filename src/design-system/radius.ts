export const radius = {
  none: "0px",
  sm: "0.25rem",    // 4px
  md: "0.5rem",     // 8px
  lg: "0.75rem",    // 12px
  xl: "1rem",       // 16px
  xxl: "1.5rem",    // 24px
  full: "9999px",
  card: "1rem",     // Consistent premium card radius
} as const;

export type Radius = typeof radius;
