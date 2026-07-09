export const typography = {
  fonts: {
    heading: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
  },
  sizes: {
    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    xxl: "1.5rem",     // 24px
    h3: "2rem",        // 32px
    h2: "3rem",        // 48px
    h1: "4rem",        // 64px
    hero: "5rem",      // 80px
  },
  weights: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export type Typography = typeof typography;
