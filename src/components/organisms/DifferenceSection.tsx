import React from "react";
import { m } from "framer-motion";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";

export const DifferenceSection: React.FC = () => {

  const metrics = [
    { title: "Modern Tech Stack", desc: "React • Next.js • FastAPI • Node" },
    { title: "Mobile-First", desc: "Pixel-perfect rendering on every screen." },
    { title: "Performance Focused", desc: "Optimized from day one for speed." },
    { title: "SEO Ready", desc: "Built for maximum search visibility." },
  ];

  return (
    <Section id="difference" padding="normal" className="bg-ivory relative">
      <m.div
        initial={{ opacity: 0.98, y: 2 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1] }}
      >
        <Container>
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14 items-end border-b border-forest/[0.06] pb-10">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
              The Tech Ambiance Difference
            </span>
            <Heading level={2}>
              Strict engineering <br />
              married to <span className="font-serif italic text-gold">luxury visuals</span>.
            </Heading>
          </div>
          <div className="lg:col-span-5">
            <Text size="lg" className="text-text-secondary max-w-md m-0">
              We reject the compromise between aesthetic motion and page speed. Every experience we compile is audited against strict metrics to ensure you rank higher and convert better.
            </Text>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="group flex flex-col gap-3 border-l border-forest/[0.06] pl-6 py-1 hover:border-gold transition-colors duration-500"
            >
              <span className="text-[12px] uppercase tracking-[0.2em] font-bold text-text-primary">
                {metric.title}
              </span>
              <Text size="sm" className="text-text-secondary m-0">
                {metric.desc}
              </Text>
            </div>
          ))}
        </div>

      </Container>
      </m.div>
    </Section>
  );
};
