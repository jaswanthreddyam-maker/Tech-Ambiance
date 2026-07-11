import React, { useRef, useState } from "react";
import { m } from "framer-motion";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading } from "../ui/Typography";
import { Play, Pause } from "lucide-react";
import { RevealHeading } from "../motion";

export const ShowreelSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Section id="showreel" padding="normal" className="bg-ivory border-t border-forest/[0.06] relative overflow-hidden">
      <Container size="wide" className="relative z-10">
        
        {/* Massive Header */}
        <div className="flex flex-col items-center text-center gap-4 mb-10">
          <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
            Tech Ambiance 2026
          </span>
          <RevealHeading>
            <Heading level={2} className="text-forest hidden md:block">
              Our latest <span className="font-serif italic text-gold">showreel</span>.
            </Heading>
          </RevealHeading>
        </div>

        {/* Video Container */}
        <m.div 
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-30%" }}
          transition={{ duration: 1.25, ease: [0.19, 1, 0.22, 1] }}
          className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden cursor-pointer group bg-forest"
          onClick={togglePlay}
        >
          {/* Fallback/Overlay Abstract Visuals since we don't have a real video yet */}
          <div className="absolute inset-0 bg-gradient-to-tr from-forest to-forest/90 z-0 flex items-center justify-center">
            <div className="w-1/2 aspect-square rounded-full border border-gold/10 blur-3xl opacity-50 animate-pulse" />
          </div>

          {/* Actual Video Element */}
          <video 
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-10 opacity-60 mix-blend-screen"
            loop
            muted
            playsInline
            preload="none"
            aria-label="Tech Ambiance Showreel Video"
          />

          {/* Play/Pause Button Overlay with soft one-time ambient illumination */}
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <m.div 
              initial={{ opacity: 0.85, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-20%" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gold/15 backdrop-blur-md border border-gold/40 flex items-center justify-center text-gold shadow-[0_0_40px_rgba(196,166,97,0.25)] group-hover:scale-105 transition-transform duration-500"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-2" />}
            </m.div>
          </div>

          {/* Dark Overlay when paused */}
          <div className={`absolute inset-0 bg-forest/30 z-10 transition-opacity duration-700 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />
          
        </m.div>
      </Container>
    </Section>
  );
};
