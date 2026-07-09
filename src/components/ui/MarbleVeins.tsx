import React from "react";

export const MarbleVeins: React.FC = () => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-85 z-0" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="veinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A572" stopOpacity="0.05" />
          <stop offset="30%" stopColor="#C5A572" stopOpacity="0.25" />
          <stop offset="70%" stopColor="#C5A572" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#C5A572" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="veinGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C5A572" stopOpacity="0.05" />
          <stop offset="40%" stopColor="#C5A572" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#C5A572" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#C5A572" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Vein 1: Smooth irregular Bezier curve */}
      <path 
        d="M -20,80 C 120,120 180,40 320,160 T 520,60" 
        fill="none" 
        stroke="url(#veinGrad1)" 
        strokeWidth="1.5" 
        style={{ filter: "blur(0.5px) drop-shadow(0 0 10px rgba(196,166,97,0.12))" }} 
      />
      
      {/* Vein 2: Irregular branch, never intersecting */}
      <path 
        d="M 80,450 C 220,380 290,440 380,310 T 520,380" 
        fill="none" 
        stroke="url(#veinGrad2)" 
        strokeWidth="1.2" 
        style={{ filter: "blur(0.5px) drop-shadow(0 0 10px rgba(196,166,97,0.12))" }} 
      />
    </svg>
  );
};
