import React from "react";
import { motion, useMotionValue } from "framer-motion";
import { useCursorHover } from "../../hooks/useCursorHover";

interface TechBadgeProps {
  name: string;
}

const TechBadge: React.FC<TechBadgeProps> = ({ name }) => {
  const { onMouseEnter, onMouseLeave: cursorMouseLeave } = useCursorHover("pointer");
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Mouse hover event mapping for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates between -0.5 and 0.5
    const relX = (e.clientX - rect.left) / width - 0.5;
    const relY = (e.clientY - rect.top) / height - 0.5;

    // Apply tilt values
    x.set(relX * 25); // Max tilt of 25deg
    y.set(relY * -25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    cursorMouseLeave();
  };

  return (
    <motion.div
      style={{
        rotateX: y,
        rotateY: x,
        transformStyle: "preserve-3d",
      }}
      onMouseEnter={onMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-surface border border-border-custom hover:border-gold px-8 py-5 rounded-2xl flex items-center justify-center shadow-sm hover:shadow-premium transition-all duration-200 cursor-pointer select-none group"
    >
      <span
        style={{ transform: "translateZ(20px)" }}
        className="text-xs uppercase font-bold tracking-widest text-text-secondary group-hover:text-gold transition-colors duration-150"
      >
        {name}
      </span>
    </motion.div>
  );
};

export const TechSection: React.FC = () => {
  const techStack = [
    "React",
    "Next.js",
    "Node.js",
    "FastAPI",
    "TypeScript",
    "TailwindCSS",
    "Supabase",
    "Framer Motion",
    "GSAP",
    "Docker",
  ];

  return (
    <section className="py-32 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-20">
          <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-gold select-none">
            Our Stack
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-light text-text-primary leading-tight">
            Engineered with <span className="font-serif italic text-gold">modern architecture</span>.
          </h2>
          <p className="text-sm text-text-secondary max-w-md font-light leading-relaxed">
            We use stable, high-performance web standards to guarantee fast delivery, security, and headless content flexibility.
          </p>
        </div>

        {/* Badges Flow Container */}
        <div className="perspective-[1000px] max-w-4xl mx-auto flex flex-wrap justify-center gap-6">
          {techStack.map((tech) => (
            <TechBadge key={tech} name={tech} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default TechSection;
