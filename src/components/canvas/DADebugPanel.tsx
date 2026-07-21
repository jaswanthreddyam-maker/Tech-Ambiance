import React, { useEffect, useState } from 'react';
import type { SceneManager } from './engine/SceneManager';
import type { QualityProfile, NarrativeState } from './engine/types';

interface DADebugPanelProps {
  sceneManager: SceneManager | null;
}

const CHAPTER_TOPOLOGIES: Record<string, string> = {
  Awakening: 'Sparse Seed Nodes',
  Expansion: 'Branching Tree Topology',
  Capability: '4 Modular Quad Clusters',
  Execution: 'Directed Linear Pipeline',
  Proof: 'Rigid Lattice Matrix (3x4)',
  Convergence: 'Radial Star Topology',
};

const CHAPTER_SEQUENCE: NarrativeState[] = [
  'Awakening',
  'Expansion',
  'Capability',
  'Execution',
  'Proof',
  'Convergence',
];

export const DADebugPanel: React.FC<DADebugPanelProps> = ({ sceneManager }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(60);
  const [profile, setProfile] = useState<QualityProfile | null>(null);
  const [narrativeState, setNarrativeState] = useState<NarrativeState>('Awakening');
  const [eventLog, setEventLog] = useState<string[]>([]);

  // Toggle overlay on Shift + D / Cycle topology on Shift + G
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      if (e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        e.preventDefault();
        if (sceneManager) {
          const currentIdx = CHAPTER_SEQUENCE.indexOf(narrativeState);
          const nextIdx = (currentIdx + 1) % CHAPTER_SEQUENCE.length;
          const nextState = CHAPTER_SEQUENCE[nextIdx];
          
          // Trigger narrative state shift via event bus or manager
          const bus = sceneManager.getEventBus();
          bus.emit('narrative.chapter', { state: nextState, previousState: narrativeState });
          setNarrativeState(nextState);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sceneManager, narrativeState]);

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

        <div className="flex justify-between text-[10px]">
          <span className="text-[#FAF7F0]/60">Topology:</span>
          <span className="font-bold text-[#C9A56A]">{CHAPTER_TOPOLOGIES[narrativeState] ?? 'Default'}</span>
        </div>
      </div>

      <div className="mt-2 text-[9px] text-[#C9A56A]/50 text-right italic">
        [Press Shift+G to cycle topology]
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
