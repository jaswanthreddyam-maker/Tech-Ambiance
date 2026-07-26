import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe, Layers, Cpu, CheckCircle2, Menu, X, Lock } from "lucide-react";
import { Logo } from "../../components/atoms/Logo";
import { useCursorHover } from "../../hooks/useCursorHover";
import { useSEO } from "../../providers/SEOProvider";
import { useConsultationModal } from "../../providers/ConsultationModalProvider";

// Interactive Safari Browser Preview Projects
interface PreviewProject {
  id: string;
  name: string;
  category: string;
  url: string;
  headline: string;
  sub: string;
  metric: string;
  metricLabel: string;
  accent: string;
  tags: string[];
}

const PREVIEW_PROJECTS: PreviewProject[] = [
  {
    id: "vistaara",
    name: "Cafe Vistaara",
    category: "Luxury Hospitality Experience",
    url: "https://cafevistaara.com",
    headline: "Sensory Dining & Bespoke Digital Table Experience",
    sub: "Architected immersive reservation engine with cinematic stone-and-light UI architecture.",
    metric: "+240%",
    metricLabel: "Direct Online Reservations",
    accent: "from-[#C5A572]/20 to-[#06291E]/30",
    tags: ["Hospitality", "3D WebGL", "Concierge Engine"]
  },
  {
    id: "technews",
    name: "Tech News Today",
    category: "High-Scale Editorial Publishing",
    url: "https://technewstoday.co",
    headline: "Real-Time Enterprise Media & Intelligence Hub",
    sub: "Sub-40ms global edge delivery with curated typographic editorial reading layouts.",
    metric: "4.8M",
    metricLabel: "Monthly Active Editorial Readers",
    accent: "from-[#06291E]/30 to-[#FAF7F0]/40",
    tags: ["Publishing", "Edge Routing", "Zero Layout Shift"]
  },
  {
    id: "scoutai",
    name: "ScoutAI",
    category: "Autonomous Enterprise Intelligence",
    url: "https://scoutai.enterprise",
    headline: "Next-Gen Autonomous Agent Orchestration Platform",
    sub: "Deep LLM telemetry pipelines wrapped in a calm, highly readable executive dashboard.",
    metric: "99.99%",
    metricLabel: "Pipeline Uptime & Telemetry SLA",
    accent: "from-[#D8C090]/25 to-[#06291E]/40",
    tags: ["Artificial Intelligence", "Autonomous Agents", "Telemetry"]
  }
];

// Architectural Ease-out Easing curve
const ARCHITECTURAL_EASE = [0.22, 1, 0.36, 1] as const;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSEO } = useSEO();
  const buttonHoverProps = useCursorHover("pointer");
  const { openConsultationModal } = useConsultationModal();
  const shouldReduceMotion = useReducedMotion();

  // Interactive browser mockup state
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHoverCard, setActiveHoverCard] = useState<number | null>(null);

  // URL typing animation effect
  const [displayedUrl, setDisplayedUrl] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setSEO({
      title: "B2B Digital Experience Studio | Tech Ambiance",
      description: "Crafting digital experiences businesses remember. Luxury editorial flagships, high-performance web products, and bespoke AI systems.",
    });
  }, [setSEO]);

  // Auto-cycle through Safari browser mockup projects every 5 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveProjectIdx((prev) => (prev + 1) % PREVIEW_PROJECTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Typing animation effect for URL bar
  useEffect(() => {
    const targetUrl = PREVIEW_PROJECTS[activeProjectIdx].url;
    if (shouldReduceMotion) {
      setDisplayedUrl(targetUrl);
      return;
    }

    setIsTyping(true);
    let currentText = "";
    let charIdx = 0;

    const interval = setInterval(() => {
      if (charIdx < targetUrl.length) {
        currentText += targetUrl[charIdx];
        setDisplayedUrl(currentText);
        charIdx++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [activeProjectIdx, shouldReduceMotion]);

  const activeProject = PREVIEW_PROJECTS[activeProjectIdx];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-6 pb-24 text-forest select-none">
      
      {/* ========================================================
          1. TOP EDITORIAL NAVBAR (LOGO | SERVICES | WORK | PROCESS | PORTAL | LOGIN & SIGN UP)
      ======================================================== */}
      <motion.header
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: ARCHITECTURAL_EASE }}
        className="flex items-center justify-between border-b border-forest/[0.12] pb-5 mb-14 md:mb-20"
      >
        {/* Left Logo */}
        <div 
          className="flex items-center gap-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 rounded-lg p-1 transition-all"
          onClick={() => navigate("/landing")}
          tabIndex={0}
          role="button"
          aria-label="Tech Ambiance Home"
        >
          <Logo size="md" />
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-9 text-[11px] uppercase tracking-[0.24em] font-bold text-forest/70" aria-label="Main Navigation">
          <a 
            href="#services" 
            className="hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-full px-2 py-1"
          >
            Disciplines
          </a>
          <a 
            href="#work" 
            className="hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-full px-2 py-1"
          >
            Live Preview
          </a>
          <a 
            href="#process" 
            className="hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-full px-2 py-1"
          >
            Standard
          </a>
          <button 
            onClick={() => navigate("/auth")} 
            className="hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 rounded-full px-2 py-1"
          >
            Portal
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3.5 md:gap-4">
          <button
            onClick={() => navigate("/auth?mode=login")}
            className="hidden md:inline-flex bg-transparent text-[#0B3027] hover:text-[#C9A56A] font-medium text-[10px] uppercase tracking-[0.18em] px-3.5 py-1.5 transition-all rounded-full focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="inline-flex px-5 py-2.5 rounded-full bg-forest text-[#C5A572] border border-gold/35 hover:border-gold text-[10px] uppercase tracking-[0.22em] font-bold transition-all shadow-sm items-center gap-2 group focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            {...buttonHoverProps}
          >
            <span>Sign Up</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 rounded-full bg-forest text-gold flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-gold"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: ARCHITECTURAL_EASE }}
            className="fixed inset-0 z-[9999] bg-[#FAF7F0] flex flex-col justify-between p-7 select-none md:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo size="md" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-forest text-gold flex items-center justify-center shadow-sm focus-visible:ring-2 focus-visible:ring-gold"
                aria-label="Close mobile navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 my-auto">
              <a
                href="#services"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold transition-colors"
              >
                Disciplines
              </a>
              <a
                href="#work"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold transition-colors"
              >
                Live Preview
              </a>
              <a
                href="#process"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold transition-colors"
              >
                Standard
              </a>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/auth");
                }}
                className="text-2xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold transition-colors"
              >
                Portal
              </button>
            </div>

            <div className="flex flex-col items-center gap-4 pb-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/auth?mode=signup");
                }}
                className="w-full max-w-xs py-4 rounded-full bg-forest text-gold font-heading font-bold uppercase tracking-[0.22em] text-xs shadow-md flex items-center justify-center gap-2"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/auth?mode=login");
                }}
                className="text-xs uppercase tracking-[0.2em] font-semibold text-forest/80 hover:text-gold py-2 px-6 transition-colors"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          2. HERO SECTION (FOCAL PATH: EYEBROW → HEADLINE → STAT & SUBTEXT → CTAS)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20 md:mb-28">
        
        {/* Left Primary Focal Column (Spans 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Eyebrow — Solely content label, no double section numbering */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ARCHITECTURAL_EASE, delay: 0.1 }}
            className="flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.32em] font-bold text-gold mb-6"
          >
            <span>B2B Digital Experience Studio</span>
            <span className="w-8 h-px bg-gold/50" />
          </motion.div>

          {/* Headline with deliberate line break rhythm and clip mask sweep */}
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: ARCHITECTURAL_EASE, delay: 0.2 }}
              className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-forest leading-[1.08] tracking-tight"
            >
              Crafting Digital Experiences <br />
              Businesses <br />
              <span className="font-serif italic text-gold font-normal">Remember.</span>
            </motion.h1>
          </div>

          {/* Supporting Copy */}
          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ARCHITECTURAL_EASE, delay: 0.35 }}
            className="text-text-secondary text-sm sm:text-base font-light leading-relaxed max-w-xl tracking-wide mb-10"
          >
            We partner with ambitious enterprises and luxury brands to architect high-performance digital flagships, mission-critical web software, and bespoke AI telemetry interfaces.
          </motion.p>

          {/* Action CTA Buttons */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: ARCHITECTURAL_EASE, delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 sm:gap-5"
          >
            {/* Primary Restrained Emerald CTA (Flat surface, no marble, gold border, arrow nudge) */}
            <button
              onClick={() => navigate("/auth")}
              className="group relative inline-flex items-center justify-center gap-3.5 px-8 py-4 rounded-full bg-forest text-[#C5A572] border border-gold/35 hover:border-gold shadow-md hover:shadow-xl transition-all font-heading text-xs font-bold uppercase tracking-[0.22em] focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              {...buttonHoverProps}
            >
              <span>Enter Studio Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>

            {/* Secondary Ghost CTA */}
            <button
              onClick={() => {
                if (window.innerWidth < 768) {
                  navigate("/experience");
                } else {
                  navigate("/intro");
                }
              }}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-transparent text-forest border border-forest/20 hover:border-gold text-xs font-bold uppercase tracking-[0.2em] transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              {...buttonHoverProps}
            >
              <span>Explore Website</span>
            </button>

            {/* Strategy Consultation CTA */}
            <button
              onClick={openConsultationModal}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-forest text-[#C5A572] border border-gold/40 hover:border-gold shadow-md text-xs font-bold uppercase tracking-[0.22em] transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              {...buttonHoverProps}
            >
              <span>Book Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </button>
          </motion.div>
        </div>

        {/* Right Secondary Column — Engineering Discipline Evidence Panel */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: ARCHITECTURAL_EASE, delay: 0.4 }}
          className="lg:col-span-5 flex flex-col justify-between h-full pt-4 lg:pt-8 border-t lg:border-t-0 lg:border-l border-forest/15 lg:pl-10"
        >
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-text-secondary block mb-2">
                Engineering Discipline
              </span>
              <p className="font-heading text-xl sm:text-2xl font-bold text-forest leading-snug">
                Strict performance SLAs combined with stone-inspired editorial art direction.
              </p>
            </div>

            {/* Old-Style Figures Editorial Numeral Layout */}
            <div className="grid grid-cols-2 gap-8 border-t border-forest/10 pt-6">
              <div>
                <span className="font-heading font-black text-3xl sm:text-4xl text-gold block mb-1 font-oldstyle">
                  0.4s
                </span>
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                  Average Edge LCP
                </span>
              </div>
              <div>
                <span className="font-heading font-black text-3xl sm:text-4xl text-gold block mb-1 font-oldstyle">
                  100
                </span>
                <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">
                  Lighthouse Core Vitals
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-forest/10 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] font-semibold text-forest/60">
            <span>Bespoke Architecture</span>
            <span>•</span>
            <span>Zero Layout Shift</span>
          </div>
        </motion.div>
      </div>

      {/* ========================================================
          3. INTERACTIVE SAFARI BROWSER MOCKUP (LIVE PROJECT PREVIEWS)
      ======================================================== */}
      <motion.section
        id="work"
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: ARCHITECTURAL_EASE }}
        className="mb-28"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Section Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gold" />
            <span className="text-xs uppercase tracking-[0.26em] font-bold text-forest">
              Live Safari Preview — Featured Flagships
            </span>
          </div>

          {/* Project Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Flagship project previews">
            {PREVIEW_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                role="tab"
                aria-selected={activeProjectIdx === idx}
                aria-controls={`preview-panel-${proj.id}`}
                onClick={() => setActiveProjectIdx(idx)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    setActiveProjectIdx((idx + 1) % PREVIEW_PROJECTS.length);
                  } else if (e.key === "ArrowLeft") {
                    setActiveProjectIdx((idx - 1 + PREVIEW_PROJECTS.length) % PREVIEW_PROJECTS.length);
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                  activeProjectIdx === idx
                    ? "bg-forest text-ivory shadow-sm border border-gold/40"
                    : "bg-white/60 text-text-secondary hover:text-forest border border-forest/10"
                }`}
                {...buttonHoverProps}
              >
                {proj.name}
              </button>
            ))}
          </div>
        </div>

        {/* macOS Safari Browser Frame */}
        <div className="rounded-3xl border border-forest/[0.14] bg-white/90 shadow-premium overflow-hidden">
          
          {/* Top macOS Chrome Safari Bar */}
          <div className="bg-[#FAF7F0] border-b border-forest/10 px-6 py-3.5 flex items-center justify-between">
            {/* macOS Skeuomorphic Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block" />
            </div>

            {/* Address Bar with Typing Blink Cursor */}
            <div className="flex items-center justify-center gap-2 max-w-md w-full bg-white border border-forest/15 rounded-lg py-1.5 px-4 text-xs font-mono text-forest/80 truncate">
              <Lock className="w-3 h-3 text-gold shrink-0" />
              <span className="truncate">{displayedUrl}</span>
              {isTyping && <span className="w-1.5 h-3.5 bg-gold inline-block animate-pulse shrink-0" />}
            </div>

            {/* Studio Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-forest/70 hidden md:inline">
                Live Browser
              </span>
            </div>
          </div>

          {/* Interactive Canvas Content Area with Crossfade + Vertical Settle */}
          <div className="relative min-h-[460px] md:min-h-[500px] p-8 md:p-14 flex flex-col justify-between overflow-hidden">
            {/* Ambient Back Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeProject.accent} opacity-40 pointer-events-none transition-all duration-700`} />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                id={`preview-panel-${activeProject.id}`}
                role="tabpanel"
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: ARCHITECTURAL_EASE }}
                className="relative z-10 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest text-gold text-[10px] uppercase tracking-widest font-bold mb-6">
                    <span>{activeProject.category}</span>
                  </div>

                  <h3 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-forest max-w-2xl leading-tight mb-4">
                    {activeProject.headline}
                  </h3>

                  <p className="text-sm sm:text-base text-text-secondary max-w-xl font-light leading-relaxed mb-8">
                    {activeProject.sub}
                  </p>
                </div>

                {/* Bottom Canvas Metric & Tags */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-forest/15 pt-6 mt-8">
                  <div>
                    <span className="font-heading font-black text-4xl sm:text-5xl text-gold block leading-none mb-1 font-oldstyle">
                      {activeProject.metric}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-forest/80">
                      {activeProject.metricLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {activeProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-white/80 border border-forest/10 text-[10px] uppercase tracking-widest font-bold text-forest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* ========================================================
          4. EDITORIAL NUMBERED DISCIPLINE CARDS (01 / 02 / 03)
      ======================================================== */}
      <motion.section
        id="services"
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: ARCHITECTURAL_EASE }}
        className="mb-28"
      >
        <div className="border-b border-forest/15 pb-4 mb-12 flex items-center justify-between">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-forest tracking-tight">
            Core Disciplines
          </h2>
          <span className="text-xs uppercase tracking-[0.24em] font-semibold text-text-secondary">
            Editorial • Engineering • Intelligence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 01 */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Core Discipline 01: Digital Products"
            onMouseEnter={() => setActiveHoverCard(1)}
            onMouseLeave={() => setActiveHoverCard(null)}
            onFocus={() => setActiveHoverCard(1)}
            onBlur={() => setActiveHoverCard(null)}
            className={`group relative bg-white/80 border transition-all duration-300 p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-premium flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
              activeHoverCard === 1 ? "border-gold -translate-y-1.5" : "border-forest/10"
            }`}
          >
            {/* GPU-Safe Border Trace Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl" overflow="visible">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                fill="none"
                stroke="#C5A572"
                strokeWidth="1.5"
                strokeDasharray="400 1200"
                strokeDashoffset={activeHoverCard === 1 ? "0" : "1600"}
                className="transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
              />
            </svg>

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-black text-5xl text-gold/40 group-hover:text-gold transition-colors font-oldstyle">
                  01
                </span>
                <Layers className="w-6 h-6 text-forest/40 group-hover:text-gold group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
              </div>

              <h3 className="font-heading font-bold text-2xl text-forest mb-4 tracking-tight">
                Digital Products
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light mb-8">
                Engineering resilient SaaS architectures, interactive web software, and custom platforms built for high performance and strict operational reliability.
              </p>
            </div>

            <div className="border-t border-forest/10 pt-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-forest">
              <span>Full-Stack Engineering</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 02 */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Core Discipline 02: Brand Websites"
            onMouseEnter={() => setActiveHoverCard(2)}
            onMouseLeave={() => setActiveHoverCard(null)}
            onFocus={() => setActiveHoverCard(2)}
            onBlur={() => setActiveHoverCard(null)}
            className={`group relative bg-white/80 border transition-all duration-300 p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-premium flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
              activeHoverCard === 2 ? "border-gold -translate-y-1.5" : "border-forest/10"
            }`}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl" overflow="visible">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                fill="none"
                stroke="#C5A572"
                strokeWidth="1.5"
                strokeDasharray="400 1200"
                strokeDashoffset={activeHoverCard === 2 ? "0" : "1600"}
                className="transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
              />
            </svg>

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-black text-5xl text-gold/40 group-hover:text-gold transition-colors font-oldstyle">
                  02
                </span>
                <Globe className="w-6 h-6 text-forest/40 group-hover:text-gold group-hover:scale-110 group-hover:rotate-45 transition-all duration-300" />
              </div>

              <h3 className="font-heading font-bold text-2xl text-forest mb-4 tracking-tight">
                Brand Websites
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light mb-8">
                Architecting luxury editorial flagships that merge bespoke visual storytelling with sub-second page load speeds and precision technical SEO.
              </p>
            </div>

            <div className="border-t border-forest/10 pt-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-forest">
              <span>Editorial Flagships</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 03 */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Core Discipline 03: AI Systems"
            onMouseEnter={() => setActiveHoverCard(3)}
            onMouseLeave={() => setActiveHoverCard(null)}
            onFocus={() => setActiveHoverCard(3)}
            onBlur={() => setActiveHoverCard(null)}
            className={`group relative bg-white/80 border transition-all duration-300 p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-premium flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
              activeHoverCard === 3 ? "border-gold -translate-y-1.5" : "border-forest/10"
            }`}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl" overflow="visible">
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                fill="none"
                stroke="#C5A572"
                strokeWidth="1.5"
                strokeDasharray="400 1200"
                strokeDashoffset={activeHoverCard === 3 ? "0" : "1600"}
                className="transition-all duration-700 ease-out opacity-0 group-hover:opacity-100"
              />
            </svg>

            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-black text-5xl text-gold/40 group-hover:text-gold transition-colors font-oldstyle">
                  03
                </span>
                <Cpu className="w-6 h-6 text-forest/40 group-hover:text-gold group-hover:scale-110 transition-all duration-300" />
              </div>

              <h3 className="font-heading font-bold text-2xl text-forest mb-4 tracking-tight">
                AI Systems
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-light mb-8">
                Integrating autonomous agents, custom LLM pipelines, and executive intelligence dashboards directly into your core enterprise stack.
              </p>
            </div>

            <div className="border-t border-forest/10 pt-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-forest">
              <span>Autonomous Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>
      </motion.section>

      {/* ========================================================
          5. CLOSING CONTINUOUS CTA BAND (ARRIVAL TONAL SHIFT)
      ======================================================== */}
      <motion.section
        id="process"
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: ARCHITECTURAL_EASE }}
        className="mb-24 bg-forest text-ivory rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-2xl border border-gold/30"
      >
        {/* Continuous Grid Pattern Overlay carrying through background grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(197, 165, 114, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(197, 165, 114, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px"
          }}
        />

        {/* Bookending Gold Corner Brackets matching opening frame */}
        <div className="absolute top-6 left-6 w-5 h-5 border-l-2 border-t-2 border-gold/50 pointer-events-none" />
        <div className="absolute top-6 right-6 w-5 h-5 border-r-2 border-t-2 border-gold/50 pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-5 h-5 border-l-2 border-b-2 border-gold/50 pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-5 h-5 border-r-2 border-b-2 border-gold/50 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold block mb-4">
              Our Studio Standard
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-ivory leading-tight mb-6">
              Stone. Architecture. <br />
              <span className="font-serif italic text-gold font-normal">Editorial Engineering.</span>
            </h2>
            <p className="text-ivory/70 text-xs sm:text-sm font-light leading-relaxed max-w-xl mb-8">
              We never ship generic templates. Every line of code and every pixel is crafted to stand the test of time—calm motion, high contrast readability, and uncompromising accessibility.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs text-ivory/80 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>Zero Layout Shift</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ivory/80 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>60 FPS Micro-Animations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-ivory/80 font-medium">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>End-to-End Client Portal</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="group px-9 py-4.5 rounded-full bg-gold text-forest font-heading font-bold text-xs uppercase tracking-[0.24em] hover:bg-ivory transition-all shadow-lg flex items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              {...buttonHoverProps}
            >
              <span>Enter Client Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-forest group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ========================================================
          6. EDITORIAL FOOTER WITH ROMAN NUMERAL STAMP
      ======================================================== */}
      <footer className="border-t border-forest/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.28em] font-bold text-forest/70">
        <div className="flex items-center gap-3">
          <span>Tech Ambiance Studio</span>
          <span className="text-gold">•</span>
          <span>B2B Digital Flagships</span>
        </div>
        <div>
          <span>Crafted in India  •  <span className="font-oldstyle tracking-widest text-gold font-bold">MMXXVI</span></span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
