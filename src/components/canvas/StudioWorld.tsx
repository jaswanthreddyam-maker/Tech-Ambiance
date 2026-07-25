import React, { useEffect, useRef, useState } from 'react';
import { WorldManager } from './engine/WorldManager';
import { useScroll } from '../../providers/ScrollProvider';
import { GoldenLightningVeins } from '../ui/GoldenLightningVeins';
import { DADebugPanel } from './DADebugPanel';

interface StudioWorldProps {
  className?: string;
  children?: React.ReactNode;
}

export const StudioWorld: React.FC<StudioWorldProps> = ({ className = '', children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldManager, setWorldManager] = useState<WorldManager | null>(null);
  const { registerTicker, unregisterTicker } = useScroll();
  const [staticFallback, setStaticFallback] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setStaticFallback(true);
        return;
      }
    }

    const manager = new WorldManager();
    setWorldManager(manager);

    // Boot DA Engine WorldManager
    manager.boot(containerRef.current, canvasRef.current);

    const tickerId = `studio-world-${Date.now()}`;
    registerTicker(tickerId, (time, delta, velocity) => {
      manager.tick(time, delta, velocity);
    });

    const handleResize = () => {
      if (containerRef.current) {
        manager.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      unregisterTicker(tickerId);
      manager.destroy();
      setWorldManager(null);
    };
  }, [registerTicker, unregisterTicker]);

  if (staticFallback) {
    return (
      <div className={`relative w-full min-h-screen overflow-hidden ${className}`}>
        <div className="absolute inset-0 pointer-events-none z-0">
          <GoldenLightningVeins variant="hero" />
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full min-h-screen ${className}`}
    >
      {/* Fixed Background 3D World Canvas Viewport */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block pointer-events-none opacity-90 transition-opacity duration-1000"
        />
      </div>

      {/* Real-time DA Metrics & Debug Telemetry */}
      {worldManager && <DADebugPanel sceneManager={worldManager.getSceneManager()} />}

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default StudioWorld;
