import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useCursorHover } from "../../hooks/useCursorHover";
import { useSEO } from "../../providers/SEOProvider";

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSEO } = React.useRef(useSEO()).current; // Prevent extra render cycles
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverProps = useCursorHover("pointer");

  const [showSkip, setShowSkip] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  React.useEffect(() => {
    setSEO({
      title: "Brand Film | Tech Ambiance",
      description: "Watch the cinematic brand introduction for Tech Ambiance, outlining our digital craftsmanship.",
    });
  }, [setSEO]);

  useEffect(() => {
    // Show skip button after 2 seconds
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);

    // Play video starting at 0.5 seconds (trimming 0.5s from start)
    if (videoRef.current) {
      videoRef.current.currentTime = 0.5;
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay was prevented by browser security rules:", err);
      });
    }

    return () => clearTimeout(timer);
  }, []);

  const handleTransition = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    // Smooth exit fade transition
    setTimeout(() => {
      navigate("/experience");
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden z-50">
      {/* Dynamic SEO Meta is injected via Provider */}

      {/* Transition Out Black Screen */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 bg-white z-[9999] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Cinematic Video Player */}
      <motion.video
        ref={videoRef}
        src="/videos/intro.mp4#t=0.5"
        preload="auto"
        autoPlay
        muted
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = 0.5;
          }
        }}
        onEnded={handleTransition}
        className="w-full h-full object-contain md:object-cover select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Skip Button (Appears after 2 seconds) positioned at Bottom Right exactly as shown */}
      <AnimatePresence>
        {showSkip && !isTransitioning && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            onClick={handleTransition}
            className="absolute bottom-10 right-10 sm:bottom-12 sm:right-14 bg-[#06291E] border-[1.5px] border-[#C5A572] text-[#C5A572] text-xs sm:text-[13px] font-heading font-bold uppercase tracking-[0.24em] px-7 py-4 sm:px-8 sm:py-5 rounded-full hover:bg-[#083829] hover:border-[#D8C090] hover:text-[#FAF7F0] transition-all duration-300 flex items-center gap-2.5 shadow-[0_12px_36px_rgba(6,41,30,0.55)] pointer-events-auto"
            {...hoverProps}
          >
            <span>SKIP INTRO</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A572]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
export default IntroPage;
