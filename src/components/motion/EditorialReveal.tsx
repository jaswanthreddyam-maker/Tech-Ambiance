import React, { useRef } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";

export interface EditorialRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

/** @public */
export const EditorialReveal: React.FC<EditorialRevealProps> = ({
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
    const words = children.split(" ");
    return (
      <div ref={ref} className={className} aria-label={children}>
        <m.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.085, delayChildren: delay },
            },
          }}
        >
          {words.map((word, index) => (
            <m.span
              key={`${word}-${index}`}
              aria-hidden="true"
              variants={{
                hidden: { opacity: 0, filter: "blur(8px)", y: 8 },
                visible: {
                  opacity: 1,
                  filter: "blur(0px)",
                  y: 0,
                  transition: { duration: 1.2, ease: LUXURY_EASE },
                },
              }}
              className="inline-block mr-[0.28em]"
            >
              {word}
            </m.span>
          ))}
        </m.div>
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <m.div
        initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
        animate={
          isInView
            ? { opacity: 1, filter: "blur(0px)", y: 0 }
            : { opacity: 0, filter: "blur(8px)", y: 8 }
        }
        transition={{ duration: 1.2, delay, ease: LUXURY_EASE }}
      >
        {children}
      </m.div>
    </div>
  );
};



