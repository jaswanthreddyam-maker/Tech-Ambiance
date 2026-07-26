import React from "react";
import { Outlet } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Cursor } from "../components/common/Cursor";

export const LandingLayout: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  // Smooth architectural spring physics for the scroll ruler indicator line
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001
  });

  const rulerTopPercent = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="min-h-screen w-screen bg-[#FAF7F0] text-text-primary overflow-x-hidden relative flex flex-col select-none">
      {/* 1. Warm Ivory Paper Texture */}
      <div className="paper-texture absolute inset-0 pointer-events-none opacity-90" />

      {/* 2. Architectural Studio Grid (64px interval) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 41, 30, 0.028) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 41, 30, 0.028) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px"
        }}
      />

      {/* 3. Soft Radial Illumination */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 20%, rgba(197, 165, 114, 0.08) 0%, rgba(6, 41, 30, 0.02) 65%, transparent 100%)"
        }}
      />

      {/* 4. Soft Top & Bottom Emerald Vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest/[0.04] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest/[0.05] to-transparent pointer-events-none" />

      {/* 5. Architectural Viewport Framing Corner Brackets */}
      <div className="fixed top-8 left-8 w-6 h-6 border-l-2 border-t-2 border-gold/40 pointer-events-none z-30 hidden lg:block" />
      <div className="fixed top-8 right-8 w-6 h-6 border-r-2 border-t-2 border-gold/40 pointer-events-none z-30 hidden lg:block" />
      <div className="fixed bottom-8 left-8 w-6 h-6 border-l-2 border-b-2 border-gold/40 pointer-events-none z-30 hidden lg:block" />
      <div className="fixed bottom-8 right-8 w-6 h-6 border-r-2 border-b-2 border-gold/40 pointer-events-none z-30 hidden lg:block" />

      {/* 6. Signature Architectural Scroll-Ruler (Margin Dimension Line) */}
      {!shouldReduceMotion && (
        <div 
          aria-hidden="true"
          className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex flex-col items-center pointer-events-none"
        >
          <span className="text-[9px] font-mono tracking-widest text-forest/40 uppercase rotate-[-90deg] mb-8 origin-center">
            DIMENSION
          </span>

          {/* Vertical axis drafting line */}
          <div className="w-px h-52 bg-forest/15 relative flex flex-col justify-between items-center">
            {/* Dimension tick marks */}
            <span className="w-2 h-px bg-forest/30 -ml-0.5" />
            <span className="w-1.5 h-px bg-forest/20 -ml-0.5" />
            <span className="w-1.5 h-px bg-forest/20 -ml-0.5" />
            <span className="w-2 h-px bg-forest/30 -ml-0.5" />

            {/* Traveling Gold Ruler Tick */}
            <motion.div
              className="absolute -left-[5px] top-0 w-3 h-[2px] bg-gold shadow-[0_0_8px_rgba(197,165,114,0.7)]"
              style={{
                top: rulerTopPercent
              }}
            />
          </div>

          <span className="text-[9px] font-mono tracking-widest text-gold/70 mt-8">
            E-01
          </span>
        </div>
      )}

      {/* Custom Cursor */}
      <Cursor />

      {/* Main Content wrapper */}
      <main className="relative z-10 w-full flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default LandingLayout;
