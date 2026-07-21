import React from 'react';
import { useProjectContext } from '../../ProjectContext';

export const GlobalProjectHero: React.FC<{ onSwitchProject: () => void }> = ({ onSwitchProject }) => {
  const { projects, activeProjectId } = useProjectContext();
  const activeProject = projects.find((p: any) => p.id === activeProjectId) || projects[0];

  if (!activeProject) return null;

  return (
    <div className="bg-[#FDFBF7] px-4 py-4 border-b border-[#0B3027]/10 sticky top-0 z-40">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest font-mono text-[#0B3027]/50">
          Tech Ambiance
        </span>
        <div className="flex items-center justify-between">
          <h1 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
            {activeProject.name}
          </h1>
          <button 
            onClick={onSwitchProject}
            className="text-[10px] uppercase tracking-wider font-semibold text-[#C9A56A] flex items-center gap-1 bg-[#C9A56A]/10 px-2.5 py-1 rounded-full"
          >
            <span>Switch</span>
            <span className="text-[8px]">▼</span>
          </button>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#0B3027]/70">
              In Progress
            </span>
          </div>
          <span className="text-[#0B3027]/20">•</span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#0B3027]">
            72%
          </span>
        </div>
      </div>
    </div>
  );
};
