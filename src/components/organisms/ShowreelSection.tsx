import React, { useRef, useState, useEffect } from "react";
import { m, useInView } from "framer-motion";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading } from "../ui/Typography";
import { RevealHeading } from "../motion";

export const ShowreelSection: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isInView = useInView(videoRef, { amount: 0.5 });

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isInView]);

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
          className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden cursor-pointer group bg-black"
          onClick={togglePlay}
        >
          {/* Actual Video Element */}
          <video 
            ref={videoRef}
            src="/assets/videos/showreel.mp4"
            className="absolute inset-0 w-full h-full object-cover z-10"
            loop
            muted
            playsInline
            preload="none"
            aria-label="Tech Ambiance Showreel Video"
          />

          {/* Dark Overlay when paused */}
          <div className={`absolute inset-0 bg-black/30 z-10 transition-opacity duration-700 pointer-events-none ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />
          
        </m.div>
      </Container>
    </Section>
  );
};
