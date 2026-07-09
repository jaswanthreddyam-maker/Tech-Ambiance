import React from "react";
import { motion } from "framer-motion";
import { useCursorHover } from "../../hooks/useCursorHover";
import { Layers, Terminal, Compass, Zap } from "lucide-react";

export const StudioSection: React.FC = () => {
  const hoverProps = useCursorHover("pointer");

  const workflowItems = [
    {
      icon: Compass,
      title: "Interactive Prototyping",
      desc: "Every visual detail is modeled in Figma. We share clickable responsive web prototypes so clients feel the layout weight and motion before we write code.",
    },
    {
      icon: Layers,
      title: "Design System Isolation",
      desc: "We build isolated color palettes, spacing metrics, and typographic scale tokens. This maintains branding uniformity across all app platforms.",
    },
    {
      icon: Terminal,
      title: "Strict Linting & Compiles",
      desc: "Our React projects compile using strict TypeScript configurations, clean ESLint files, and fast bundle compilers to avoid client viewport load errors.",
    },
    {
      icon: Zap,
      title: "Automated Deploy Pipeline",
      desc: "Every commit pushes to Vercel/Docker edge networks. Continuous testing triggers automatically to audit performance scores and metadata schemas.",
    },
  ];

  return (
    <section className="py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-center">
          <div className="lg:col-span-6 text-left flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold select-none">
              Behind The Scenes
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight">
              A studio built on <br />
              <span className="font-serif italic text-gold">craftsmanship</span> & rigor.
            </h2>
          </div>
          <div className="lg:col-span-6 text-left">
            <p className="text-sm text-text-secondary font-light leading-relaxed">
              We operate like a modern product studio. We use Linear for ticketing backlog items, Figma for layout mockups, GitHub for code reviews, and automated compilers for speed testing.
            </p>
          </div>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {workflowItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-surface border border-border-custom hover:border-gold hover:shadow-premium p-8 rounded-2xl text-left flex gap-6 items-start transition-all duration-300"
                {...hoverProps}
              >
                <div className="p-3 bg-bg-primary rounded-xl text-gold shrink-0 border border-border-custom/50">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default StudioSection;
