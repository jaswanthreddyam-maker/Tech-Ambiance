export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  cursor: 9999, // Custom cursor must always be on top
} as const;

export type ZIndex = typeof zIndex;
