import React from "react";
import { Outlet } from "react-router-dom";
import { Cursor } from "../components/common/Cursor";

export const LandingLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-[#FAF7F0] text-text-primary overflow-x-hidden relative flex flex-col select-none">
      {/* 1. Warm Ivory Paper Texture */}
      <div className="paper-texture absolute inset-0 pointer-events-none opacity-90" />

      {/* 2. Subtle Architectural Studio Grid (64px interval) */}
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

      {/* 3. Very Soft Radial Illumination */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 25%, rgba(197, 165, 114, 0.09) 0%, rgba(6, 41, 30, 0.03) 65%, transparent 100%)"
        }}
      />

      {/* 4. Soft Top & Bottom Emerald Vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-forest/[0.04] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest/[0.05] to-transparent pointer-events-none" />

      {/* 5. Architectural Viewport Framing Brackets (Luxury Editorial Lookbook Studio) */}
      <div className="absolute top-8 left-8 w-6 h-6 border-l border-t border-forest/20 pointer-events-none hidden sm:block" />
      <div className="absolute top-8 right-8 w-6 h-6 border-r border-t border-forest/20 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-8 left-8 w-6 h-6 border-l border-b border-forest/20 pointer-events-none hidden sm:block" />
      <div className="absolute bottom-8 right-8 w-6 h-6 border-r border-b border-forest/20 pointer-events-none hidden sm:block" />

      {/* Custom Cursor */}
      <Cursor />

      {/* Content wrapper */}
      <main className="relative z-10 w-full flex-grow">
        <Outlet />
      </main>
    </div>
  );
};
