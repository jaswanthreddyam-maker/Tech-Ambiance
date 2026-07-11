import React from "react";

export const MarbleVeins: React.FC = () => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-25 z-0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="veinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A572" stopOpacity="0.05" />
          <stop offset="30%" stopColor="#C5A572" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#C5A572" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C5A572" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Minimal single smooth hairline golden crack */}
      <path 
        d="M -20,80 C 120,120 180,40 320,160 T 520,60" 
        fill="none" 
        stroke="url(#veinGrad1)" 
        strokeWidth="0.8" 
        style={{ filter: "blur(0.5px) drop-shadow(0 0 6px rgba(196,166,97,0.1))" }} 
      />
    </svg>
  );
};
