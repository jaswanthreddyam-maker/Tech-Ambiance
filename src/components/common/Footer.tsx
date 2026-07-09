import React from "react";
import { Link } from "react-router-dom";
import { useScroll } from "../../providers/ScrollProvider";
import { useCursorHover } from "../../hooks/useCursorHover";
import { ROUTES } from "../../routes/routes";
import { Container } from "../layout/Container";
import { MarbleVeins } from "../ui/MarbleVeins";
import logoImg from "../../assets/logo.png";

export const Footer: React.FC = () => {
  const { lenis } = useScroll();
  const hoverProps = useCursorHover("pointer");

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-emerald-stone pt-16 pb-10 overflow-hidden relative text-gold rounded-t-[32px]">
      
      {/* Marble Champagne Veins */}
      <MarbleVeins />
      
      {/* Background watermark completely removed from layout flow */}
      <div className="absolute inset-x-0 bottom-4 pointer-events-none select-none opacity-[0.02] text-center hidden md:block z-0">
        <span className="text-[110px] font-heading font-bold tracking-[0.08em] text-gold block leading-none">
          TECH AMBIANCE
        </span>
      </div>

      <Container size="default" className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          
          {/* Logo & Manifesto */}
          <div className="md:col-span-2 flex flex-col items-start gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-3 group text-left hover:scale-105 transition-transform"
              {...hoverProps}
            >
              <img
                src={logoImg}
                alt="Tech Ambiance"
                className="block object-contain mix-blend-multiply"
                style={{ height: "36px", width: "66px" }}
              />
            </button>
            <p className="text-[14px] font-sans font-light leading-relaxed text-gold/70 max-w-sm m-0">
              Crafting digital experiences that businesses remember.
            </p>
            <span className="text-[10px] text-gold/40 uppercase tracking-widest font-semibold block mt-1">
              Built in India. Designed for the world.
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-gold/80 m-0">
              Navigation
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to={ROUTES.services} className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>Services</Link>
              </li>
              <li>
                <Link to={ROUTES.work} className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>Featured Projects</Link>
              </li>
              <li>
                <Link to={ROUTES.insights} className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>Insights</Link>
              </li>
              <li>
                <Link to={ROUTES.manifesto} className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>Manifesto</Link>
              </li>
            </ul>
          </div>

          {/* Connect & Socials */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] uppercase font-bold tracking-[0.2em] text-gold/80 m-0">
              Connect
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <a href="mailto:hello.techambiance@gmail.com" className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>hello.techambiance@gmail.com</a>
              </li>
              <li>
                <a href="https://instagram.com/tech.ambiance" target="_blank" rel="noopener noreferrer" className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>Instagram</a>
              </li>
              <li>
                <Link to={ROUTES.portal} className="text-[13px] text-gold/70 hover:text-gold transition-colors" {...hoverProps}>Client Portal</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="flex flex-col items-center gap-6 border-t border-gold/10 pt-8 relative z-10">
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-gold/40 font-light m-0">
              &copy; {new Date().getFullYear()} Tech Ambiance Studio. All rights reserved.
            </p>
            <div className="flex gap-6 text-[11px] text-gold/40 font-light">
              <Link to="/privacy" className="hover:text-gold transition-colors" {...hoverProps}>
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-gold transition-colors" {...hoverProps}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};
export default Footer;
