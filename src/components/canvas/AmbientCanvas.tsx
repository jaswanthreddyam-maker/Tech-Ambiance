import React, { useEffect, useRef, useState } from 'react';
import { SceneManager } from './engine/SceneManager';
import { useScroll } from '../../providers/ScrollProvider';
import { GoldenLightningVeins } from '../ui/GoldenLightningVeins';
import { DADebugPanel } from './DADebugPanel';

interface AmbientCanvasProps {
  className?: string;
}

export const AmbientCanvas: React.FC<AmbientCanvasProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sceneManager, setSceneManager] = useState<SceneManager | null>(null);
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

    const manager = new SceneManager();
    setSceneManager(manager);

    // Boot 6-layer DA-Engine
    manager.boot(containerRef.current, canvasRef.current);

    const tickerId = `da-engine-${Date.now()}`;
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
      setSceneManager(null);
    };
  }, [registerTicker, unregisterTicker]);

  if (staticFallback) {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
        <GoldenLightningVeins variant="hero" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block pointer-events-none opacity-85 transition-opacity duration-1000"
      />
      <DADebugPanel sceneManager={sceneManager} />
    </div>
  );
};

export default AmbientCanvas;
