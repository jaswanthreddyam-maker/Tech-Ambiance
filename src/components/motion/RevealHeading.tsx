import React, { useRef } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";

export interface RevealHeadingProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export const RevealHeading: React.FC<RevealHeadingProps> = ({
  children,
  className = "",
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className}>
      <m.div
        initial={{
          opacity: 0,
          filter: "blur(10px)",
          y: 10,
          clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                filter: "blur(0px)",
                y: 0,
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              }
            : {
                opacity: 0,
                filter: "blur(10px)",
                y: 10,
                clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)",
              }
        }
        transition={{
          duration: 1.25,
          delay,
          ease: LUXURY_EASE,
        }}
      >
        {children}
      </m.div>
    </div>
  );
};
