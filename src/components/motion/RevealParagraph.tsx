import React, { useRef } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";

export interface RevealParagraphProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export const RevealParagraph: React.FC<RevealParagraphProps> = ({
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

  if (typeof children === "string") {
    const lines = children.split("\n").filter((line) => line.trim().length > 0);
    if (lines.length > 1) {
      return (
        <div ref={ref} className={className} aria-label={children}>
          <m.div
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.11, delayChildren: delay },
              },
            }}
          >
            {lines.map((line, index) => (
              <m.p
                key={index}
                aria-hidden="true"
                variants={{
                  hidden: { opacity: 0, filter: "blur(6px)", y: 6 },
                  visible: {
                    opacity: 1,
                    filter: "blur(0px)",
                    y: 0,
                    transition: { duration: 1.2, ease: LUXURY_EASE },
                  },
                }}
                className="mb-2 last:mb-0"
              >
                {line}
              </m.p>
            ))}
          </m.div>
        </div>
      );
    }
  }

  return (
    <div ref={ref} className={className}>
      <m.div
        initial={{ opacity: 0, filter: "blur(6px)", y: 6 }}
        animate={
          isInView
            ? { opacity: 1, filter: "blur(0px)", y: 0 }
            : { opacity: 0, filter: "blur(6px)", y: 6 }
        }
        transition={{ duration: 1.2, delay, ease: LUXURY_EASE }}
      >
        {children}
      </m.div>
    </div>
  );
};
