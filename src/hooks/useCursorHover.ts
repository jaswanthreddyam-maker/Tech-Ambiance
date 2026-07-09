import { useCursor } from "../providers/CursorProvider";
import type { CursorType } from "../providers/CursorProvider";

export const useCursorHover = (type: CursorType = "pointer", text = "") => {
  const { setCursorType } = useCursor();

  const onMouseEnter = () => {
    setCursorType(type, text);
  };

  const onMouseLeave = () => {
    setCursorType("default");
  };

  return { onMouseEnter, onMouseLeave };
};
