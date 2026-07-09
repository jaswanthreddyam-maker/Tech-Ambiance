import React, { createContext, useContext, useState, useEffect } from "react";

export type CursorType = "default" | "pointer" | "magnetic" | "text" | "hide" | "gallery";

interface CursorContextType {
  cursorType: CursorType;
  cursorText: string;
  setCursorType: (type: CursorType, text?: string) => void;
}

const CursorContext = createContext<CursorContextType>({
  cursorType: "default",
  cursorText: "",
  setCursorType: () => {},
});

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorType, setCursorTypeState] = useState<CursorType>("default");
  const [cursorText, setCursorText] = useState<string>("");

  const setCursorType = (type: CursorType, text = "") => {
    setCursorTypeState(type);
    setCursorText(text);
  };

  useEffect(() => {
    // Add custom cursor class to body for hide/show behavior in CSS
    document.body.classList.add("custom-cursor-active");
    return () => {
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <CursorContext.Provider value={{ cursorType, cursorText, setCursorType }}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => useContext(CursorContext);
