import React from "react";
import { m } from "framer-motion";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { useCursorHover } from "../../hooks/useCursorHover";

export const BuiltForSection: React.FC = () => {
  const hoverProps = useCursorHover("pointer");

  const industries = [
    "Luxury Architecture",
    "Private Equity",
    "SaaS Platforms",
    "High-Fashion Retail",
    "Real Estate",
    "Boutique Hotels",
  ];

  // Duplicate the list to ensure seamless infinite looping scroll
  const scrollList = [...industries, ...industries];

  return (
    <Section id="built-for" padding="none" className="border-y border-forest/10 overflow-hidden relative bg-forest/5">
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-30%" }}
        transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1] }}
        className="w-full"
      >
        <Container size="full" className="flex flex-col md:flex-row items-center relative z-10 p-0">
          
          {/* Left Heading Box */}
          <div className="shrink-0 bg-forest text-gold px-8 py-6 flex items-center justify-center w-full md:w-auto h-full min-h-[80px]">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-gold select-none whitespace-nowrap">
              Built For
            </span>
          </div>

          {/* Infinitely Scrolling Client Track */}
          <div className="flex-1 w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
            <div className="flex gap-16 w-max animate-scroll py-5 md:py-0 items-center">
              {scrollList.map((industry, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-16 group"
                  {...hoverProps}
                >
                  <span className="text-[11px] md:text-[12px] font-semibold tracking-[0.24em] text-forest/40 uppercase group-hover:text-forest transition-colors duration-500 select-none whitespace-nowrap m-0">
                    {industry}
                  </span>
                  {/* Separator dot */}
                  <span className="text-gold/50 text-[10px] select-none m-0">•</span>
                </div>
              ))}
            </div>
          </div>

        </Container>
      </m.div>

      {/* Tailwind Infinite Scroll Keyframe Injection */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </Section>
  );
};
