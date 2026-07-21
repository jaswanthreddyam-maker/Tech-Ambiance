import React, { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Section } from "../layout/Section";
import { Container } from "../layout/Container";
import { Heading, Text } from "../ui/Typography";
import { Button } from "../ui/Button";
import { MarbleVeins } from "../ui/MarbleVeins";
import { ROUTES } from "../../routes/routes";
import { useNavigate } from "react-router-dom";
import { useConsultationModal } from "../../providers/ConsultationModalProvider";
import { RevealHeading } from "../motion";
import { GoldenLightningVeins } from "../ui/GoldenLightningVeins";

interface ShowcaseProject {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  live: boolean;
  accent: string;
  image?: string;
}

const SHOWCASE_PROJECTS: ShowcaseProject[] = [
  {
    id: "vistaara",
    title: "Coffy Mine",
    category: "Luxury Hospitality",
    url: "techambiance.studio/vistaara",
    description: "A complete digital transformation focusing on organic reservations and an immersive brand experience.",
    live: true,
    accent: "from-[#C5A572]/25 via-[#06291E]/80 to-[#06291E]",
    image: "/assets/images/projects/coffee-mine-cover-opt.webp"
  },
  {
    id: "coffea",
    title: "Cafe",
    category: "Artisanal Coffee Studio",
    url: "coffeastudio.in",
    description: "Bespoke sensory e-commerce flagship crafted with calm stone-inspired architecture and rapid edge checkout.",
    live: true,
    accent: "from-[#D8C090]/30 via-[#06291E]/85 to-[#06291E]",
    image: "/assets/images/projects/cafe-cover-hero-opt.webp"
  },
  {
    id: "kubera",
    title: "Gym",
    category: "Fine Dining Flagship",
    url: "kuberacafe.luxury",
    description: "Architectural table booking and immersive culinary lookbook engineered for zero layout shift.",
    live: true,
    accent: "from-[#E0C896]/25 via-[#06291E]/85 to-[#06291E]",
    image: "/assets/images/projects/gym-bolt-cover-opt.webp"
  },
  {
    id: "technews",
    title: "Tech News Today",
    category: "Enterprise Media Hub",
    url: "technewstoday.co",
    description: "High-scale editorial publishing platform delivering sub-40ms global edge readership across 4.8M readers.",
    live: true,
    accent: "from-[#FAF7F0]/25 via-[#06291E]/85 to-[#06291E]",
    image: "/assets/images/projects/tech-news-cover-opt.webp"
  },
  {
    id: "scoutai",
    title: "ScoutAI",
    category: "Autonomous Enterprise Intelligence",
    url: "scoutai.enterprise",
    description: "Next-generation autonomous AI telemetry pipelines wrapped in a calm, highly readable executive dashboard.",
    live: true,
    accent: "from-[#D8C090]/25 via-[#06291E]/80 to-[#06291E]"
  },
  {
    id: "gochicken",
    title: "Go Chicken",
    category: "Rapid Gourmet Delivery",
    url: "gochicken.express",
    description: "Custom real-time dispatch and streamlined mobile-first ordering flagship engineered for extreme reliability.",
    live: true,
    accent: "from-[#C5A572]/25 via-[#06291E]/85 to-[#06291E]",
    image: "/assets/images/projects/go-chicken-cover-hero-opt.webp"
  }
];

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      opacity: { duration: 0.5 },
      scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      opacity: { duration: 0.4 },
      scale: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  })
};

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { openConsultationModal } = useConsultationModal();

  const [[currentIndex, direction], setCurrentIndex] = useState([0, 1]);
  const [isPaused, setIsPaused] = useState(false);

  const paginate = useCallback((newDirection: number) => {
    setCurrentIndex(([prevIndex]) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = SHOWCASE_PROJECTS.length - 1;
      if (nextIndex >= SHOWCASE_PROJECTS.length) nextIndex = 0;
      return [nextIndex, newDirection];
    });
  }, []);

  const setIndexDirectly = (targetIndex: number) => {
    setCurrentIndex(([prevIndex]) => [targetIndex, targetIndex > prevIndex ? 1 : -1]);
  };

  // Autoplay every 3.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, paginate]);

  const activeProject = SHOWCASE_PROJECTS[currentIndex];

  return (
    <Section id="hero" padding="large" className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Floating Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gold/5 rounded-full filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gold/3 rounded-full filter blur-[120px] animate-pulse pointer-events-none" />

      {/* Exquisitely crafted champagne-gold lightning veins */}
      <GoldenLightningVeins variant="hero" />

      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10 relative">
        {/* LEFT PANEL: Copy & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-start text-left gap-8">
          <m.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col gap-4"
          >
            <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-gold select-none">
              Premium Digital Studio
            </span>
            <RevealHeading>
              <Heading level={1}>
                We build digital <br />
                <span className="font-serif italic text-gold">experiences</span> that <br />
                businesses remember.
              </Heading>
            </RevealHeading>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
            className="flex flex-wrap gap-x-3 items-center text-forest/70"
          >
            <Text>Modern websites.</Text>
            <span className="text-gold">•</span>
            <Text>Powerful SEO.</Text>
            <span className="text-gold">•</span>
            <Text>Scalable apps.</Text>
          </m.div>

          {/* Action buttons */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.22 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
          >
            <Button 
              variant="primary" 
              size="lg" 
              className="ambient-cta-shimmer"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate(ROUTES.work)}
            >
              View Portfolio
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              onClick={openConsultationModal}
            >
              Book Free Consultation
            </Button>
          </m.div>
        </div>

        {/* RIGHT PANEL: Floating Browser Showcase Carousel */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.25, ease: [0.19, 1, 0.22, 1], delay: 0.08 }}
          className="lg:col-span-5 flex flex-col items-start justify-center w-full max-w-lg mx-auto lg:mx-0"
        >
          {/* Small uppercase label above browser mockup */}
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-[#C9A56A] text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 select-none"
          >
            OUR PROJECTS
          </m.div>

          {/* Floating Browser Mockup Wrapper (GPU Accelerated 3-5px float animation) */}
          <m.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-full flex flex-col border border-forest/[0.08] rounded-2xl overflow-hidden bg-[#FAF7F0] shadow-[0_30px_65px_rgba(6,41,30,0.08)] group relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Custom TA Browser Header (Safari macOS style in warm ivory) */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-forest/[0.06] bg-[#FAF7F0] select-none z-30 relative">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-400/70" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
                <div className="w-2 h-2 rounded-full bg-green-400/70" />
              </div>

              {/* Dynamic URL Bar */}
              <m.span
                key={activeProject.url}
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[9px] tracking-[0.08em] text-forest/70 font-medium font-sans bg-forest/[0.05] px-4 py-0.5 rounded-full border border-forest/[0.08] truncate max-w-[210px]"
              >
                {activeProject.url}
              </m.span>

              {/* Live Indicator */}
              <div className="flex items-center gap-1.5">
                {activeProject.live && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span className="text-[8px] uppercase tracking-widest text-text-secondary font-semibold">
                  {activeProject.live ? "Live" : "Preview"}
                </span>
              </div>
            </div>

            {/* Carousel Canvas Area (Fixed 4:3 ratio to prevent layout shift) */}
            <div className="relative aspect-[4/3] w-full bg-emerald-stone overflow-hidden cursor-pointer">
              <AnimatePresence initial={false} custom={direction}>
                <m.div
                  key={activeProject.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-end text-gold select-none"
                  style={{ willChange: "transform, opacity" }}
                  onClick={() => navigate(ROUTES.work)}
                >
                  {/* Slide Image or Fallback */}
                  {activeProject.image && (
                    <img 
                      src={activeProject.image} 
                      alt={activeProject.title}
                      fetchPriority={currentIndex === 0 ? "high" : "auto"}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                    />
                  )}

                  {/* Backdrop Radial Illumination & Text Legibility Gradient */}
                  {!activeProject.image && (
                    <div className={`absolute inset-0 bg-gradient-to-tr ${activeProject.accent} opacity-60 pointer-events-none`} />
                  )}
                  <div 
                    className={`absolute inset-0 z-10 pointer-events-none ${
                      activeProject.image 
                        ? 'bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80' 
                        : 'bg-gradient-to-t from-[#06291E] via-[#06291E]/60 to-transparent'
                    }`} 
                  />

                  {/* Marble Champagne Veins */}
                  {!activeProject.image && <MarbleVeins />}

                  {/* Decorative Luxury Abstract Ring */}
                  {!activeProject.image && (
                    <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none z-10">
                      <div className="w-[115%] h-[115%] border-[36px] border-gold/30 rounded-full blur-3xl" />
                    </div>
                  )}

                  {/* Slide Content */}
                  <div className="relative z-20 flex flex-col gap-2">
                    <span className="text-[#C9A56A] text-[9px] uppercase tracking-widest font-bold">
                      {activeProject.category}
                    </span>
                    <Heading level={2} className="text-[#FAF7F0] m-0 leading-tight">
                      {activeProject.title}
                    </Heading>
                    <Text size="sm" className="text-[#FAF7F0]/80 max-w-[90%] m-0 line-clamp-2">
                      {activeProject.description}
                    </Text>
                  </div>
                </m.div>
              </AnimatePresence>

              {/* Hover Navigation Arrow Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                aria-label="Previous project"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[#06291E]/80 border border-[#C9A56A]/40 text-[#C9A56A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#06291E] hover:scale-105 shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                aria-label="Next project"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-[#06291E]/80 border border-[#C9A56A]/40 text-[#C9A56A] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#06291E] hover:scale-105 shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </m.div>

          {/* Elegant Subtle Pagination Dots Below Mockup */}
          <div className="w-full flex items-center justify-center gap-1 mt-4 select-none">
            {SHOWCASE_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => setIndexDirectly(idx)}
                aria-label={`Go to ${proj.title}`}
                className="p-3 flex items-center justify-center relative group"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentIndex
                      ? "w-6 bg-[#C9A56A] shadow-sm"
                      : "w-1.5 bg-forest/20 group-hover:bg-[#C9A56A]/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </m.div>
      </Container>
    </Section>
  );
};
