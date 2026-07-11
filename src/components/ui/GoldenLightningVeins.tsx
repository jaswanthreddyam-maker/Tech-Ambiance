import React, { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";

export type GoldenLightningVeinVariant =
  | "hero"
  | "portfolio"
  | "process"
  | "testimonials"
  | "cta"
  | "footer";

export interface GoldenLightningVeinsProps {
  variant: GoldenLightningVeinVariant;
  className?: string;
}

interface VeinPath {
  id: string;
  d: string;
  strokeWidth: number;
  responsiveClass?: string; // e.g. "" (all), "hidden md:inline" (tablet+), "hidden lg:inline" (desktop only)
}

const VEIN_PATTERNS: Record<GoldenLightningVeinVariant, VeinPath[]> = {
  hero: [
    // Large sweeping fracture entering from upper left
    {
      id: "hero-main",
      d: "M -20,60 L 110,105 L 185,92 L 310,165 L 440,148 L 590,260 L 740,235 L 920,380 L 1050,355",
      strokeWidth: 1.4,
    },
    // Secondary upper branch
    {
      id: "hero-branch-1",
      d: "M 310,165 L 365,115 L 490,95 L 610,35",
      strokeWidth: 1.0,
      responsiveClass: "hidden md:inline",
    },
    // Delicate tertiary downward split
    {
      id: "hero-branch-2",
      d: "M 590,260 L 630,335 L 585,410 L 660,490",
      strokeWidth: 0.8,
      responsiveClass: "hidden lg:inline",
    },
  ],
  portfolio: [
    // Diagonal vein behind cards
    {
      id: "portfolio-main",
      d: "M 40,490 L 195,395 L 285,420 L 460,265 L 610,290 L 780,140 L 960,85",
      strokeWidth: 1.35,
    },
    // Diagonal upper split
    {
      id: "portfolio-branch-1",
      d: "M 460,265 L 495,185 L 640,135 L 720,40",
      strokeWidth: 0.95,
      responsiveClass: "hidden md:inline",
    },
    // Subtle lower root
    {
      id: "portfolio-branch-2",
      d: "M 285,420 L 355,490 L 485,510",
      strokeWidth: 0.75,
      responsiveClass: "hidden lg:inline",
    },
  ],
  process: [
    // Horizontal interconnected network
    {
      id: "process-main",
      d: "M -10,240 L 160,215 L 290,260 L 480,210 L 670,255 L 860,195 L 1040,235",
      strokeWidth: 1.3,
    },
    // Lateral cross-connecting branch
    {
      id: "process-branch-1",
      d: "M 290,260 L 340,345 L 510,320 L 640,395",
      strokeWidth: 0.9,
      responsiveClass: "hidden md:inline",
    },
    // Upper delicate fracture
    {
      id: "process-branch-2",
      d: "M 480,210 L 535,135 L 710,110",
      strokeWidth: 0.75,
      responsiveClass: "hidden lg:inline",
    },
  ],
  testimonials: [
    // Elegant split across testimonial track
    {
      id: "test-main",
      d: "M 80,85 L 260,155 L 390,130 L 580,270 L 750,240 L 940,365",
      strokeWidth: 1.35,
    },
    // Lower sweeping fork
    {
      id: "test-branch-1",
      d: "M 390,130 L 425,65 L 590,40 L 730,15",
      strokeWidth: 0.95,
      responsiveClass: "hidden md:inline",
    },
    // Delicate fine fissure
    {
      id: "test-branch-2",
      d: "M 580,270 L 625,355 L 780,385",
      strokeWidth: 0.75,
      responsiveClass: "hidden lg:inline",
    },
  ],
  cta: [
    // Minimal elegant central fracture
    {
      id: "cta-main",
      d: "M 180,35 L 310,115 L 430,95 L 560,195 L 710,165 L 860,275",
      strokeWidth: 1.25,
    },
    // Fine secondary offshoot
    {
      id: "cta-branch-1",
      d: "M 430,95 L 485,35 L 640,20",
      strokeWidth: 0.85,
      responsiveClass: "hidden md:inline",
    },
  ],
  footer: [
    // Largest and most dramatic architectural network
    {
      id: "footer-main-1",
      d: "M -30,140 L 165,210 L 315,160 L 510,315 L 710,265 L 915,420 L 1060,390",
      strokeWidth: 1.45,
    },
    {
      id: "footer-main-2",
      d: "M 315,160 L 385,85 L 580,60 L 760,135 L 940,95",
      strokeWidth: 1.15,
      responsiveClass: "hidden md:inline",
    },
    {
      id: "footer-branch-1",
      d: "M 510,315 L 565,410 L 745,445 L 880,520",
      strokeWidth: 0.9,
      responsiveClass: "hidden lg:inline",
    },
    {
      id: "footer-branch-2",
      d: "M 165,210 L 215,310 L 375,345",
      strokeWidth: 0.8,
      responsiveClass: "hidden lg:inline",
    },
  ],
};

export const GoldenLightningVeins: React.FC<GoldenLightningVeinsProps> = ({
  variant,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();
  const paths = VEIN_PATTERNS[variant];

  // State to track which vein is currently pulsing (if any)
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextPulse = () => {
      // Random interval between 2.5 and 5.5 seconds for frequent elegant electrical blinks
      const delay = Math.floor(Math.random() * 3000) + 2500;

      timeoutId = setTimeout(() => {
        // Pick one random vein from the current variant
        const randomVein = paths[Math.floor(Math.random() * paths.length)];
        setPulsingId(randomVein.id);

        // Blink lasts 780ms
        setTimeout(() => {
          setPulsingId(null);
          scheduleNextPulse();
        }, 780);
      }, delay);
    };

    scheduleNextPulse();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [paths, shouldReduceMotion]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 550"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Muted luxury champagne gold linear gradient */}
          <linearGradient
            id={`gold-vein-${variant}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
            <stop offset="40%" stopColor="#E5C158" stopOpacity="1" />
            <stop offset="70%" stopColor="#C5A059" stopOpacity="1" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="1" />
          </linearGradient>

          {/* Bright electric blue sapphire linear gradient for active blinks */}
          <linearGradient
            id={`blue-vein-${variant}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
            <stop offset="35%" stopColor="#00E5FF" stopOpacity="1" />
            <stop offset="65%" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
          </linearGradient>
        </defs>

        {paths.map((vein) => {
          const isPulsing = pulsingId === vein.id;

          return (
            <m.path
              key={vein.id}
              d={vein.d}
              fill="none"
              stroke={isPulsing ? `url(#blue-vein-${variant})` : `url(#gold-vein-${variant})`}
              strokeWidth={vein.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={
                isPulsing
                  ? {
                      opacity: [0.25, 0.88, 0.45, 0.98, 0.25],
                      filter: [
                        "drop-shadow(0 0 5px rgba(212, 175, 55, 0.25))",
                        "drop-shadow(0 0 14px rgba(0, 229, 255, 0.95))",
                        "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))",
                        "drop-shadow(0 0 18px rgba(0, 229, 255, 1))",
                        "drop-shadow(0 0 5px rgba(212, 175, 55, 0.25))",
                      ],
                    }
                  : {
                      opacity: [0.2, 0.3, 0.2],
                      filter: [
                        "drop-shadow(0 0 4px rgba(212, 175, 55, 0.2))",
                        "drop-shadow(0 0 7px rgba(212, 175, 55, 0.35))",
                        "drop-shadow(0 0 4px rgba(212, 175, 55, 0.2))",
                      ],
                    }
              }
              transition={
                isPulsing
                  ? {
                      duration: 0.78,
                      times: [0, 0.2, 0.45, 0.7, 1],
                      ease: "easeInOut",
                    }
                  : {
                      duration: 4.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
              className={vein.responsiveClass || ""}
            />
          );
        })}
      </svg>
    </div>
  );
};
