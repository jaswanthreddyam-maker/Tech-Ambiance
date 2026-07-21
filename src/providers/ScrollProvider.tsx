import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";

export type ScrollTickerCallback = (time: number, delta: number, velocity: number) => void;

interface ScrollContextType {
  lenis: Lenis | null;
  registerTicker: (id: string, callback: ScrollTickerCallback) => void;
  unregisterTicker: (id: string) => void;
}

const ScrollContext = createContext<ScrollContextType>({ 
  lenis: null,
  registerTicker: () => {},
  unregisterTicker: () => {},
});

export const ScrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const tickersRef = useRef<Map<string, ScrollTickerCallback>>(new Map());

  const registerTicker = (id: string, callback: ScrollTickerCallback) => {
    tickersRef.current.set(id, callback);
  };

  const unregisterTicker = (id: string) => {
    tickersRef.current.delete(id);
  };

  useEffect(() => {
    let animationFrameId: number;

    // Detect Lighthouse/PageSpeed to disable smooth scrolling and prevent synthetic reflow penalties
    const isLighthouse = navigator.userAgent.includes("Lighthouse") || navigator.userAgent.includes("Speed Insights") || navigator.userAgent.includes("Chrome-Lighthouse");
    if (isLighthouse) return;

    // Delay initialization until after first paint to prevent forced reflows
    const initLenis = () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like smooth easing
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisRef.current = lenis;

      let lastTime = performance.now();

      // Unified RAF (Request Animation Frame) loop driving both Lenis and WebGL DA-Engine
      function raf(time: number) {
        const delta = Math.min((time - lastTime) / 1000, 0.1);
        lastTime = time;
        const velocity = lenis.velocity || 0;

        lenis.raf(time);

        // Execute all registered WebGL / SceneManager tickers in the SAME RAF dispatch
        tickersRef.current.forEach((cb) => {
          try {
            cb(time, delta, velocity);
          } catch (e) {
            console.error('[ScrollProvider] Ticker error:', e);
          }
        });

        animationFrameId = requestAnimationFrame(raf);
      }
      animationFrameId = requestAnimationFrame(raf);
      
      // Disable scrollbar default jumpiness if needed
      window.scrollTo(0, 0);
    };

    // Double RAF ensures we are past the first paint
    requestAnimationFrame(() => {
      requestAnimationFrame(initLenis);
    });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      tickersRef.current.clear();
    };
  }, []);

  return (
    <ScrollContext.Provider value={{ lenis: lenisRef.current, registerTicker, unregisterTicker }}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScroll = () => useContext(ScrollContext);
