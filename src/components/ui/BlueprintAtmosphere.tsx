import React from "react";
import { motion } from "framer-motion";

export const BlueprintAtmosphere: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.03] select-none mix-blend-multiply">
      <motion.div
        className="absolute inset-0 w-[200%] h-[200%]"
        initial={{ y: 0, x: 0 }}
        animate={{ y: "-50%", x: "-50%" }}
        transition={{
          duration: 300, // extremely slow, roughly 1px/sec depending on screen size
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Grid Pattern */}
            <pattern id="blueprint-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#0B3D2E" strokeWidth="0.5" />
            </pattern>
            
            {/* Diagonal Lines Pattern */}
            <pattern id="blueprint-diagonals" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 200 L 200 0 M -100 100 L 100 -100 M 100 300 L 300 100" fill="none" stroke="#0B3D2E" strokeWidth="0.25" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
          <rect width="100%" height="100%" fill="url(#blueprint-diagonals)" />
        </svg>
      </motion.div>
    </div>
  );
};
