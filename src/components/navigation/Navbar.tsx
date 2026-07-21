import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll } from "../../providers/ScrollProvider";
import { useCursorHover } from "../../hooks/useCursorHover";
import { Magnetic } from "../atoms/Magnetic";
import { useAuth } from "../../providers/AuthProvider";
import { ROUTES } from "../../routes/routes";
import logoImg from "../../assets/logo.webp";

const Navbar: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { lenis } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();
  const hoverProps = useCursorHover("pointer");
  const buttonHoverProps = useCursorHover("magnetic");
  const { isAuthenticated } = useAuth();

  // Track window resizing for JS responsive calculations
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 1024;

  const [mouseY, setMouseY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(false);

  // 1. Listen to scroll events to toggle capsule compression
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const current = window.scrollY;
      setScrollY(current);
      if (current !== lastScrollY) {
        setIsScrollingUp(current < lastScrollY);
      }
      lastScrollY = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track Mouse Position for dynamic expansion
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => setMouseY(e.clientY);
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const isScrolled = scrollY > 40;
  
  // Dynamic Island Expansion Logic
  // Expand if: we are on mobile, OR near the top, OR mouse is near top, OR scrolling upward, OR hovering the capsule explicitly.
  const isExpanded = isMobile || scrollY < 120 || mouseY < 120 || isScrollingUp || isHovered;

  // 2. Context-Aware section tracking using IntersectionObserver
  useEffect(() => {
    const sections = ["hero", "services", "portfolio", "process", "contact"];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: "-25% 0px -55% 0px", // Trigger active state when section enters center window
          threshold: 0.15,
        }
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    
    if (location.pathname !== "/experience") {
      navigate(`/experience#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element && lenis) {
          lenis.scrollTo(element, { offset: -80 });
        }
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      if (element && lenis) {
        lenis.scrollTo(element, { offset: -80 });
      }
    }
  };

  const navLinks = [
    { name: "Services", id: "services", action: () => navigate(ROUTES.services), desktop: true },
    { name: "Portfolio", id: "portfolio", action: () => navigate(ROUTES.portfolio), desktop: true },
    { name: "Process", id: "process", action: () => handleNavClick("process"), desktop: true },
    { name: "Blueprint", id: "insights", action: () => navigate(ROUTES.insights), desktop: true },
    { name: "Portal", id: "portal", action: () => navigate(isAuthenticated ? ROUTES.portal : "/auth"), desktop: true },
  ];

  const isPortalActive = location.pathname.startsWith("/portal") || location.pathname.startsWith("/auth");

  // Dynamic values calculation (Apple Dynamic Island / Raycast Inspired capsule transitions)
  const navHeight = isMobile
    ? (isMobileMenuOpen ? 370 : (isScrolled ? 56 : 64))
    : (isExpanded ? (isScrolled ? (isHovered ? 68 : 62) : (isHovered ? 80 : 74)) : 62);

  const navWidth = isMobile
    ? "calc(100% - 36px)"
    : (isExpanded ? (isScrolled ? (isHovered ? "94%" : "90%") : "96%") : "80px");

  const navMaxWidth = isMobile
    ? "none"
    : (isExpanded ? (isScrolled ? "1100px" : "1180px") : "80px");

  const navLeft = isMobile 
    ? "18px"
    : (isExpanded 
        ? (isScrolled 
            ? (isHovered ? "calc(50vw - min(47vw, 550px))" : "calc(50vw - min(45vw, 550px))")
            : "calc(50vw - min(48vw, 590px))")
        : "calc(50vw - min(45vw, 550px))");

  const borderRadius = isMobile && isMobileMenuOpen ? 24 : (isExpanded ? 30 : 999);

  // Context-Aware styles interpolation
  let bg = "rgba(250, 247, 240, 0.88)";
  let border = "rgba(6, 41, 30, 0.08)";
  let shadow = "0 20px 50px rgba(6, 41, 30, 0.05)";
  let blurVal = "24px";

  if (activeSection === "hero" && !isScrolled) {
    bg = "rgba(250, 247, 240, 0.72)";
    border = "rgba(6, 41, 30, 0.06)";
    shadow = "0 10px 30px rgba(6, 41, 30, 0.02)";
    blurVal = "18px";
  } else if (isScrolled) {
    bg = isHovered ? "rgba(250, 247, 240, 0.96)" : "rgba(250, 247, 240, 0.92)";
    shadow = "0 24px 64px rgba(6, 41, 30, 0.08)";
    blurVal = "28px";
  }

  const finalShadow = `${shadow}, inset 0 1px 0 rgba(255, 255, 255, 0.4)`;

  // Padding calculations
  let paddingX = isExpanded ? (isScrolled ? 12 : 16) : 0;
  let paddingY = isExpanded ? (isScrolled ? 7 : 10) : 0;
  if (isExpanded && isHovered && !isMobile) {
    paddingX += 2;
    paddingY += 1;
  }

  // Dynamic Spacing between Navigation Link elements
  let navGap = isScrolled ? 16 : 24;
  if (isHovered && !isMobile) navGap += 4;

  return (
    <>
      {/* =========================================================
          DESKTOP VIEW: FLOATING CAPSULE NAVBAR (screens >= 1024px)
      ========================================================= */}
      {!isMobile && (
        <motion.nav
          layout
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredLink(null);
          }}
          initial={false}
          animate={{
            height: navHeight,
            width: navWidth,
            maxWidth: navMaxWidth,
            left: navLeft,
            borderRadius: borderRadius,
            backgroundColor: bg,
            borderColor: border,
            boxShadow: finalShadow,
            paddingLeft: paddingX,
            paddingRight: paddingX,
            paddingTop: paddingY,
            paddingBottom: paddingY,
          }}
          transition={{ 
            layout: { type: "spring", stiffness: 350, damping: 30 },
            width: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            maxWidth: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            left: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            height: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            borderRadius: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed top-[28px] z-[9990] flex overflow-hidden border select-none"
          style={{
            backdropFilter: `blur(${blurVal}) saturate(180%)`,
            WebkitBackdropFilter: `blur(${blurVal}) saturate(180%)`,
          }}
        >
          <div className={`w-full h-full relative flex items-center ${isExpanded ? "justify-between" : "justify-center"}`}>
            
            {/* Logo Capsule wrapper */}
            <motion.div
              layout
              className="relative z-20 flex items-center justify-center shrink-0"
              animate={{ scale: isExpanded ? (isScrolled ? 0.95 : 1) : 1.15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatePresence>
                {!isExpanded && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.15, 0.22, 0.15] }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ 
                      opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 bg-[#C5A572] blur-xl rounded-full z-0 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <Link
                to="/experience"
                className="relative z-10 block transition-all duration-300 group py-1"
                {...hoverProps}
              >
                <img
                  src={logoImg}
                  alt="Tech Ambiance"
                  className="block object-contain mix-blend-multiply"
                  style={{ height: "34px", width: "62px" }}
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation Links (Centered) */}
            <AnimatePresence>
              {isExpanded && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                  <motion.div 
                    initial={{ opacity: 0, filter: "blur(10px)", y: -10 }}
                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                    exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
                    transition={{ 
                      duration: 0.25, 
                      delay: isExpanded ? 0.12 : 0, 
                      ease: "easeOut" 
                    }}
                    className="flex items-center shrink-0"
                  >
                    <div className="flex items-center" style={{ gap: `${navGap}px` }}>
                    {navLinks.map((link) => {
                      const isActive = link.id === "portal" ? isPortalActive : activeSection === link.id;
                      const isHoveredItem = hoveredLink === link.name;
                      const { onMouseEnter: cursorEnter, onMouseLeave: cursorLeave } = hoverProps;

                      return (
                        <Magnetic key={link.name}>
                          <button
                            onClick={link.action}
                            onMouseEnter={() => {
                              setHoveredLink(link.name);
                              cursorEnter();
                            }}
                            onMouseLeave={() => {
                              setHoveredLink(null);
                              cursorLeave();
                            }}
                            className="text-[9px] uppercase tracking-[0.18em] font-semibold text-text-secondary hover:text-gold transition-colors py-1.5 px-3 rounded-full relative flex items-center whitespace-nowrap"
                          >
                            <span className="relative z-10 flex items-center gap-1.5">
                              {link.name}
                              {link.id === "portfolio" && (
                                <AnimatePresence>
                                  {activeSection === "portfolio" && (
                                    <motion.span
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      className="px-1.5 py-0.5 text-[8px] font-black bg-gold text-white rounded-full flex items-center justify-center z-10"
                                    >
                                      5
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              )}
                            </span>

                            {isActive && (
                              <motion.span
                                layoutId="activeNavPill"
                                className="absolute inset-0 bg-gold/8 border border-gold/15 rounded-full"
                                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                              />
                            )}

                            {!isActive && isHoveredItem && (
                              <motion.span
                                layoutId="hoverNavPill"
                                className="absolute inset-0 bg-gold/4 rounded-full"
                                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                              />
                            )}
                          </button>
                        </Magnetic>
                      );
                    })}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Desktop Authentication Actions (Login & Sign Up) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, filter: "blur(10px)", y: -10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(10px)", y: -10 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: isExpanded ? 0.12 : 0, 
                    ease: "easeOut" 
                  }}
                  className="shrink-0 flex items-center gap-3.5 md:gap-4 z-10"
                >
                    {/* Login Action */}
                    <Magnetic>
                      <button
                        onClick={() => navigate("/auth?mode=login")}
                        onMouseEnter={hoverProps.onMouseEnter}
                        onMouseLeave={hoverProps.onMouseLeave}
                        className="bg-transparent text-[#0B3027] hover:text-[#C9A56A] hover:opacity-90 font-medium text-[9.5px] uppercase tracking-[0.18em] px-4 py-1.5 transition-all duration-300 no-underline rounded-full select-none whitespace-nowrap"
                      >
                        Login
                      </button>
                    </Magnetic>

                    {/* Sign Up Action */}
                    <Magnetic>
                      <motion.button
                        onClick={() => navigate("/auth?mode=signup")}
                        className="btn-emerald-stone !text-[#C5A572] uppercase tracking-widest font-semibold flex items-center justify-center gap-2 rounded-full border border-forest hover:shadow-[0_4px_16px_rgba(6,41,30,0.12)] select-none relative group overflow-hidden whitespace-nowrap"
                        style={{ color: "#C5A572" }}
                        animate={{
                          paddingLeft: isScrolled ? "14px" : "18px",
                          paddingRight: isScrolled ? "14px" : "18px",
                          paddingTop: isScrolled ? "8px" : "10px",
                          paddingBottom: isScrolled ? "8px" : "10px",
                          fontSize: isScrolled ? "8.5px" : "9.5px",
                        }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        {...buttonHoverProps}
                      >
                        <span className="whitespace-nowrap relative z-10 !text-[#C5A572] font-bold">
                          Sign Up
                        </span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300 mt-0.5 !text-[#C5A572] relative z-10" />
                      </motion.button>
                    </Magnetic>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.nav>
      )}

      {/* =========================================================
          MOBILE VIEW: STANDALONE LOGO & HAMBURGER ICON (screens < 1024px)
          No floating navbar bar wrapper!
      ========================================================= */}
      {isMobile && (
        <>
          {/* Top-Left Standalone Studio Logo */}
          <div className="fixed top-5 left-5 z-[9990]">
            <Link
              to="/experience"
              className="flex items-center justify-center transition-all duration-300 hover:scale-105 py-1"
            >
              <img
                src={logoImg}
                alt="Tech Ambiance"
                className="block object-contain mix-blend-multiply"
                style={{ height: "30px", width: "56px" }}
              />
            </Link>
          </div>

          {/* Top-Right Standalone Mobile Controls (Sign Up & Hamburger) */}
          <div className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[9990] flex items-center gap-2.5">
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="btn-emerald-stone !text-[#C5A572] uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5 rounded-full border border-forest px-4 py-2.5 text-[9px] shadow-md active:scale-95 transition-all"
              style={{ color: "#C5A572" }}
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-11 h-11 rounded-full bg-forest text-gold flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Full-Screen Luxury Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-[9999] bg-[#FAF7F0] flex flex-col justify-between p-7 select-none"
              >
                {/* Top Row: Brand & Close Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={logoImg}
                      alt="Tech Ambiance"
                      className="block object-contain mix-blend-multiply"
                      style={{ height: "34px", width: "62px" }}
                    />
                  </div>

                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-11 h-11 rounded-full bg-forest text-gold flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Center Menu Items */}
                <div className="flex flex-col items-center justify-center gap-6 my-auto">
                  {navLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => {
                        link.action();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-[0.2em] text-forest/80 hover:text-gold active:text-gold transition-colors py-1"
                    >
                      {link.name}
                    </button>
                  ))}
                </div>

                {/* Bottom Row: Authentication Controls & Coordinates */}
                <div className="flex flex-col items-center gap-4 pb-4">
                  <button
                    onClick={() => {
                      navigate("/auth?mode=signup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full max-w-xs py-4 rounded-full bg-forest text-gold font-heading font-bold uppercase tracking-[0.22em] text-xs shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Sign Up</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      navigate("/auth?mode=login");
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs uppercase tracking-[0.2em] font-semibold text-forest/80 hover:text-gold py-2 px-6 transition-colors"
                  >
                    Login
                  </button>

                  <div className="text-[10px] uppercase tracking-[0.24em] font-semibold text-forest/50 mt-2">
                    B2B Digital Flagships • MMXXVI
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
};
export default Navbar;

