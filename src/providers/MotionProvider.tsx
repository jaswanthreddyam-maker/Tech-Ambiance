import { createContext, useContext, type ReactNode } from "react";
import { LazyMotion, domAnimation, useReducedMotion as useFramerReducedMotion } from "framer-motion";

export const motionTokens = {
  durations: {
    micro: 0.15,
    fast: 0.3,
    medium: 0.6,
    slow: 0.9,
    reveal: 1.2,
  },
  easings: {
    editorial: [0.16, 1, 0.3, 1],
    snappy: [0.32, 0.72, 0, 1],
  },
  distance: {
    micro: 4,
    small: 8,
    medium: 16,
    large: 24,
  },
  materials: {
    stone: {
      rest: { filter: "brightness(1) contrast(1)", boxShadow: "0 10px 30px rgba(6,41,30,0.04)" },
      hover: { filter: "brightness(1.02) contrast(1.05)", boxShadow: "0 20px 50px rgba(6,41,30,0.08)" },
      focus: { filter: "brightness(1.05) contrast(1.1)", boxShadow: "0 0 0 2px rgba(196,166,97,0.3)" },
    },
    glass: {
      rest: { backdropFilter: "blur(12px)", backgroundColor: "rgba(250,247,240,0.5)" },
      hover: { backdropFilter: "blur(16px)", backgroundColor: "rgba(250,247,240,0.6)" },
      focus: { backdropFilter: "blur(20px)", backgroundColor: "rgba(250,247,240,0.8)" },
    },
    paper: {
      rest: { backgroundColor: "#FAF7F0", boxShadow: "0 2px 10px rgba(6,41,30,0.02)" },
      hover: { backgroundColor: "#F7F3EA", boxShadow: "0 5px 15px rgba(6,41,30,0.05)" },
      focus: { backgroundColor: "#F5F0E1", boxShadow: "0 0 0 2px rgba(6,41,30,0.1)" },
    },
    metal: {
      rest: { opacity: 0.9, filter: "saturate(0.8) brightness(1)" },
      hover: { opacity: 1, filter: "saturate(1) brightness(1.1)" },
      focus: { opacity: 1, filter: "saturate(1.2) brightness(1.2)" },
    }
  }
};

type MotionContextType = typeof motionTokens & { isReducedMotion: boolean };

const MotionContext = createContext<MotionContextType>({
  ...motionTokens,
  isReducedMotion: false,
});

export const useMotion = () => useContext(MotionContext);

export const MotionProvider = ({ children }: { children: ReactNode }) => {
  const isReducedMotion = useFramerReducedMotion() ?? false;

  return (
    <MotionContext.Provider value={{ ...motionTokens, isReducedMotion }}>
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </MotionContext.Provider>
  );
};
