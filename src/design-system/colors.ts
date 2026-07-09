export const colors = {
  background: "#FFFFFF",
  surface: "#FCFBF8",
  forest: "#0A3D2C",
  text: {
    primary: "#111111",
    secondary: "#666666",
  },
  gold: {
    primary: "#C79A3B",
    light: "#E6D3A3",
  },
  border: "#ECE7DD",
} as const;

export type Colors = typeof colors;
