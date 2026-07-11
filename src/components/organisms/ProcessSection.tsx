import React, { useRef } from "react";
import { m, useScroll, useSpring } from "framer-motion";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { RevealHeading } from "../motion";
import { GoldenLightningVeins } from "../ui/GoldenLightningVeins";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Discovery",
    subtitle: "Strategy & Alignment",
    description: "We dive deep into your business goals, target audience, and market position to establish a solid foundation for the project.",
  },
  {
    number: "02",
    title: "Design",
    subtitle: "Visual & UX",
    description: "Creating premium, conversion-focused interfaces that perfectly balance aesthetic luxury with intuitive user experiences.",
  },
  {
    number: "03",
    title: "Development",
    subtitle: "Engineering",
    description: "Writing clean, scalable code using modern tech stacks. Every pixel is translated into a lightning-fast digital reality.",
  },
  {
    number: "04",
    title: "Launch",
    subtitle: "Deployment & Growth",
    description: "Rigorous testing, performance optimization, and SEO setup before we push your new digital presence live to the world.",
  },
];

export const ProcessSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <Section id="process" padding="normal" className="bg-surface relative overflow-hidden">
      <GoldenLightningVeins variant="process" />
      <m.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-30%" }}
        transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1] }}
      >
        <Container>
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
            Typical Project Flow
          </span>
          <RevealHeading>
            <Heading level={2} className="max-w-2xl">
              How we compile <br />
              your <span className="font-serif italic text-gold">digital authority</span>.
            </Heading>
          </RevealHeading>
        </div>

        {/* Timeline container */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto pl-8 md:pl-24">
          
          {/* Vertical track line (Grey) */}
          <div className="absolute left-[15px] md:left-[47px] top-4 bottom-4 w-[2px] bg-forest/10" />

          {/* Scrolling progress line (Forest Green) */}
          <m.div
            style={{ scaleY, originY: 0 }}
            className="absolute left-[15px] md:left-[47px] top-4 bottom-4 w-[2px] bg-forest"
          />

          {/* Timeline steps */}
          <div className="flex flex-col gap-16">
            {PROCESS_STEPS.map((step, idx) => (
              <m.div
                key={step.number}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="flex flex-col md:flex-row gap-6 md:gap-12 relative text-left group"
              >
                {/* Step Bubble (Aligned over line) */}
                <div className="absolute -left-[28px] md:-left-[60px] top-0 flex items-center justify-center">
                  <m.div
                    whileInView={{ borderColor: "rgba(6, 41, 30, 0.8)", backgroundColor: "rgb(250, 247, 240)" }}
                    viewport={{ once: false, margin: "-200px" }}
                    className="w-[20px] h-[20px] md:w-[26px] md:h-[26px] rounded-full border-2 border-forest/20 bg-surface transition-colors duration-500 z-10 flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-forest" />
                  </m.div>
                </div>

                {/* Left Side: Step Number */}
                <div className="shrink-0 select-none">
                  <div className="font-heading text-4xl md:text-5xl font-light text-gold tracking-tight leading-none group-hover:scale-105 transition-transform duration-500 origin-left">
                    {step.number}
                  </div>
                </div>

                {/* Right Side: Step details */}
                <div className="flex-grow flex flex-col gap-2">
                  <Heading level={4} className="text-forest m-0 leading-tight">
                    {step.title}
                  </Heading>
                  <div className="text-[9px] uppercase font-bold tracking-[0.15em] text-gold select-none">
                    {step.subtitle}
                  </div>
                  <Text size="sm" className="text-text-secondary max-w-xl m-0 mt-1">
                    {step.description}
                  </Text>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </Container>
      </m.div>
    </Section>
  );
};

