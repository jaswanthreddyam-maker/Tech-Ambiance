import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Globe, Layers, Cpu, CheckCircle2, Menu, X } from "lucide-react";
import { Logo } from "../../components/atoms/Logo";
import { MarbleVeins } from "../../components/ui/MarbleVeins";
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

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSEO } = useSEO();
  const buttonHoverProps = useCursorHover("pointer");
  const { openConsultationModal } = useConsultationModal();

  // State for interactive browser mockup
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setSEO({
      title: "B2B Digital Experience Studio | Tech Ambiance",
      description: "Crafting digital experiences businesses remember. Luxury editorial flagships, high-performance web products, and bespoke AI systems.",
    });
  }, [setSEO]);

  // Auto-cycle through Safari browser mockup projects every 4.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveProjectIdx((prev) => (prev + 1) % PREVIEW_PROJECTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const activeProject = PREVIEW_PROJECTS[activeProjectIdx];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pt-6 pb-24 text-forest select-none">
      
      {/* ========================================================
          1. TOP EDITORIAL NAVBAR (LOGO | SERVICES | WORK | PROCESS | PORTAL | LET'S TALK)
      ======================================================== */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, ease: [0.19, 1, 0.22, 1] }}
        className="flex items-center justify-between border-b border-forest/[0.1] pb-5 mb-14 md:mb-20"
      >
        {/* Left Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/landing")}>
          <Logo size="md" />
        </div>

        {/* Center Navigation Links (Minimal Luxury Agency) */}
        <nav className="hidden md:flex items-center gap-9 text-[11px] uppercase tracking-[0.24em] font-bold text-forest/70">
          <a href="#services" className="hover:text-gold transition-colors">Services</a>
          <a href="#work" className="hover:text-gold transition-colors">Work</a>
          <a href="#process" className="hover:text-gold transition-colors">Process</a>
          <button onClick={() => navigate("/auth")} className="hover:text-gold transition-colors">Portal</button>
        </nav>

        {/* Right Action: Desktop Authentication Actions OR Mobile Sign Up + Hamburger */}
        <div className="flex items-center gap-3.5 md:gap-4">
          {/* Desktop Login Button */}
          <button
            onClick={() => navigate("/auth?mode=login")}
            className="hidden md:inline-flex bg-transparent text-[#0B3027] hover:text-[#C9A56A] hover:opacity-90 font-medium text-[10px] uppercase tracking-[0.18em] px-3.5 py-1.5 transition-all duration-300 no-underline rounded-full select-none"
          >
            Login
          </button>

          {/* Sign Up Primary Luxury CTA (Desktop + Mobile) */}
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="inline-flex px-5 py-2.5 rounded-full bg-forest text-[#C5A572] border border-gold/30 hover:border-gold text-[10px] uppercase tracking-[0.22em] font-bold transition-all shadow-sm items-center gap-2 group"
            {...buttonHoverProps}
          >
            <span>Sign Up</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 rounded-full bg-forest text-gold flex items-center justify-center shadow-sm hover:scale-105 active:scale-95 transition-all"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* Mobile Full-Screen Luxury Menu Drawer for LandingPage */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999] bg-[#FAF7F0] flex flex-col justify-between p-7 select-none md:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo size="md" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-forest text-gold flex items-center justify-center shadow-sm"
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
                Services
              </a>
              <a
                href="#work"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold transition-colors"
              >
                Work
              </a>
              <a
                href="#process"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold transition-colors"
              >
                Process
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
          2. HERO SECTION (B2B DIGITAL EXPERIENCE STUDIO)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20 md:mb-28">
        {/* Left Editorial Copy (Spans 7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Subtitle Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.19, 1, 0.22, 1], delay: 0.15 }}
            className="flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.32em] font-bold text-gold mb-6"
          >
            <span>B2B Digital Experience Studio</span>
            <span className="w-8 h-px bg-gold/50" />
          </motion.div>

          {/* Huge Architectural Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.15, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-forest leading-[1.08] tracking-tight mb-8"
          >
            Crafting Digital Experiences <br />
            Businesses <br />
            <span className="font-serif italic text-gold font-normal">Remember.</span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.45 }}
            className="text-text-secondary text-sm sm:text-base font-light leading-relaxed max-w-xl tracking-wide mb-10"
          >
            We partner with ambitious enterprises and luxury brands to architect high-performance digital flagships, mission-critical web software, and bespoke AI telemetry interfaces.
          </motion.p>

          {/* Action CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.6 }}
            className="flex flex-wrap items-center gap-5"
          >
            {/* Primary Emerald Stone CTA */}
            <button
              onClick={() => navigate("/auth")}
              className="group relative inline-flex items-center justify-center gap-3.5 px-8 py-4 rounded-full bg-forest text-ivory border border-gold/35 shadow-[0_12px_32px_rgba(6,41,30,0.22)] hover:border-gold hover:shadow-[0_16px_40px_rgba(6,41,30,0.32)] transition-all overflow-hidden font-heading text-xs font-bold uppercase tracking-[0.22em]"
              {...buttonHoverProps}
            >
              <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
                <MarbleVeins />
              </div>
              <span className="relative z-10">Enter Studio Portal</span>
              <ArrowRight className="relative z-10 w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Gold Ghost CTA */}
            <button
              onClick={() => navigate("/intro")}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-transparent text-forest border border-forest/20 hover:border-gold text-xs font-bold uppercase tracking-[0.2em] transition-all"
              {...buttonHoverProps}
            >
              <span>Explore Full Website</span>
            </button>

            {/* Book Free Strategy Consultation CTA */}
            <button
              onClick={openConsultationModal}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-forest text-[#C5A572] border border-gold/40 hover:border-gold shadow-lg hover:shadow-xl text-xs font-bold uppercase tracking-[0.22em] transition-all"
              {...buttonHoverProps}
            >
              <span>Book Free Consultation</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </button>
          </motion.div>
        </div>

        {/* Right Column Brief Editorial Stats (Spans 5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1], delay: 0.5 }}
          className="lg:col-span-5 flex flex-col justify-between h-full pt-4 lg:pt-12 border-t lg:border-t-0 lg:border-l border-forest/10 lg:pl-12"
        >
          <div className="flex flex-col gap-10">
            <div>
              <span className="text-[10px] uppercase tracking-[0.28em] font-bold text-text-secondary block mb-2">
                Engineering Discipline
              </span>
              <p className="font-heading text-2xl font-bold text-forest leading-snug">
                Strict performance SLAs combined with stone-inspired editorial art direction.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-forest/10 pt-8">
              <div>
                <span className="font-heading font-black text-4xl text-gold block mb-1">0.4s</span>
                <span className="text-[11px] uppercase tracking-wider text-text-secondary font-medium">
                  Average Edge LCP
                </span>
              </div>
              <div>
                <span className="font-heading font-black text-4xl text-gold block mb-1">100</span>
                <span className="text-[11px] uppercase tracking-wider text-text-secondary font-medium">
                  Lighthouse Core Vitals
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 lg:mt-0 pt-6 border-t border-forest/10 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] font-semibold text-forest/60">
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
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.25, ease: [0.19, 1, 0.22, 1], delay: 0.75 }}
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
          <div className="flex flex-wrap items-center gap-2">
            {PREVIEW_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => setActiveProjectIdx(idx)}
                className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold transition-all ${
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
          {/* Top Chrome Safari Window Bar */}
          <div className="bg-[#FAF7F0] border-b border-forest/10 px-6 py-3.5 flex items-center justify-between">
            {/* macOS Traffic Light Dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block" />
            </div>

            {/* Address Bar */}
            <div className="flex items-center justify-center gap-2 max-w-md w-full bg-white border border-forest/15 rounded-lg py-1.5 px-4 text-xs font-mono text-forest/70 truncate">
              <span className="text-gold">🔒</span>
              <span>{activeProject.url}</span>
            </div>

            {/* Studio Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-forest/70 hidden md:inline">
                Live Preview
              </span>
            </div>
          </div>

          {/* Interactive Browser Canvas Content Area */}
          <div className="relative min-h-[460px] md:min-h-[520px] p-8 md:p-14 flex flex-col justify-between overflow-hidden">
            {/* Ambient Back Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeProject.accent} opacity-40 pointer-events-none transition-all duration-700`} />

            {/* Top Project Category Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
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

                {/* Bottom Card Footer inside Safari Canvas */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-t border-forest/15 pt-6 mt-8">
                  {/* Metric Display */}
                  <div>
                    <span className="font-heading font-black text-4xl sm:text-5xl text-gold block leading-none mb-1">
                      {activeProject.metric}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-forest/80">
                      {activeProject.metricLabel}
                    </span>
                  </div>

                  {/* Tags */}
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
      <section id="services" className="mb-28">
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
          <div className="group relative bg-white/80 border border-forest/10 hover:border-gold p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-black text-5xl text-gold/40 group-hover:text-gold transition-colors">
                  01
                </span>
                <Layers className="w-6 h-6 text-forest/40 group-hover:text-gold transition-colors" />
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
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 02 */}
          <div className="group relative bg-white/80 border border-forest/10 hover:border-gold p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-black text-5xl text-gold/40 group-hover:text-gold transition-colors">
                  02
                </span>
                <Globe className="w-6 h-6 text-forest/40 group-hover:text-gold transition-colors" />
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
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 03 */}
          <div className="group relative bg-white/80 border border-forest/10 hover:border-gold p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-heading font-black text-5xl text-gold/40 group-hover:text-gold transition-colors">
                  03
                </span>
                <Cpu className="w-6 h-6 text-forest/40 group-hover:text-gold transition-colors" />
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
              <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. PROCESS & DIFFERENCE SNAPSHOT
      ======================================================== */}
      <section id="process" className="mb-24 bg-forest text-ivory rounded-3xl p-8 sm:p-12 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <MarbleVeins />
        </div>

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
              className="px-9 py-4.5 rounded-full bg-gold text-forest font-heading font-bold text-xs uppercase tracking-[0.24em] hover:bg-ivory transition-colors shadow-lg"
              {...buttonHoverProps}
            >
              Enter Client Workspace
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. EDITORIAL FOOTER
      ======================================================== */}
      <footer className="border-t border-forest/15 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.28em] font-bold text-forest/60">
        <div className="flex items-center gap-3">
          <span>Tech Ambiance Studio</span>
          <span className="text-gold">•</span>
          <span>B2B Digital Flagships</span>
        </div>
        <div>
          <span>Crafted in India  •  MMXXVI</span>
        </div>
      </footer>

    </div>
  );
};
export default LandingPage;
