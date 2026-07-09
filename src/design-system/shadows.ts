export const shadows = {
  sm: "0 2px 8px rgba(0, 0, 0, 0.04)",
  md: "0 4px 20px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 30px rgba(0, 0, 0, 0.08)",
  glass: "0 8px 32px 0 rgba(199, 154, 59, 0.03)", // Subtle gold-tinted glass shadow
  premium: "0 30px 60px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)",
} as const;

export type Shadows = typeof shadows;
