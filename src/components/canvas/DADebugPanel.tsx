import React, { useEffect, useState } from 'react';
import type { SceneManager } from './engine/SceneManager';
import type { QualityProfile, NarrativeState } from './engine/types';

interface DADebugPanelProps {
  sceneManager: SceneManager | null;
}

export const DADebugPanel: React.FC<DADebugPanelProps> = ({ sceneManager }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [profile, setProfile] = useState<QualityProfile | null>(null);
  const [narrativeState, setNarrativeState] = useState<NarrativeState | string>('Awakening');
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Toggle overlay on Shift + D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to engine metrics
  useEffect(() => {
    if (!sceneManager || !isOpen) return;

    const bus = sceneManager.getEventBus();

    const unsubTick = bus.on('render.tick', ({ delta }) => {
      if (delta > 0) {
        setFps(Math.round(1 / delta));
      }
    });

    const unsubProfile = bus.on('performance.profile', ({ profile }) => {
      setProfile(profile);
    });

    const unsubChapter = bus.on('narrative.chapter', ({ state }) => {
      setNarrativeState(state);
      setEventLog(prev => [`[Narrative] State shifted -> ${state}`, ...prev.slice(0, 4)]);
    });

    const unsubPointer = bus.on('interaction.pointer', ({ normalizedX, normalizedY }) => {
      setEventLog(prev => [`[Pointer] X: ${normalizedX.toFixed(2)}, Y: ${normalizedY.toFixed(2)}`, ...prev.slice(0, 4)]);
    });

    return () => {
      unsubTick();
      unsubProfile();
      unsubChapter();
      unsubPointer();
    };
  }, [sceneManager, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-[#0B3027]/95 text-[#FAF7F0] border border-[#C9A56A]/40 rounded-xl p-4 shadow-2xl font-mono text-xs w-80 backdrop-blur-md select-none">
      <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#C9A56A]/20">
        <span className="font-bold text-[#C9A56A] uppercase tracking-wider text-[10px]">
          DA Engine Inspector
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#C9A56A]/60 hover:text-[#C9A56A] text-[10px]"
        >
          [ESC / Shift+D]
        </button>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between">
          <span className="text-[#FAF7F0]/60">FPS:</span>
          <span className={`font-bold ${fps >= 55 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-rose-400'}`}>
            {fps} FPS
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#FAF7F0]/60">Profile:</span>
          <span className="font-bold text-[#C9A56A]">{profile?.name ?? 'Balanced'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#FAF7F0]/60">Target DPR:</span>
          <span className="font-bold text-white">{profile?.maxDpr ?? 1.0}x</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#FAF7F0]/60">Story Chapter:</span>
          <span className="font-bold text-emerald-300">{narrativeState}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-[#C9A56A]/15">
        <div className="text-[9px] uppercase font-bold text-[#C9A56A]/70 mb-1">
          Event Stream
        </div>
        <div className="space-y-1 text-[10px] text-[#FAF7F0]/70 font-mono">
          {eventLog.length === 0 ? (
            <span className="italic text-[#FAF7F0]/40">Awaiting events...</span>
          ) : (
            eventLog.map((log, idx) => (
              <div key={idx} className="truncate">{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
