import React from 'react';
import { useProjectContext } from './ProjectContext';

export const Overview: React.FC = () => {
  const { projects, activeProjectId } = useProjectContext();
  const activeProject = projects.find(p => p.id === activeProjectId);

  if (!activeProject) return null;

  return (
    <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/30 shadow-lg">
      <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027] mb-2">
        {activeProject.name}
      </h2>
      <div className="grid grid-cols-6 gap-2.5 mt-6">
        {['DISCOVERY', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'MAINTENANCE'].map((stage) => {
          const isActive = activeProject.lifecycle_stage === stage;
          return (
            <div
              key={stage}
              className={`py-3 px-2 rounded-xl text-center text-[10px] font-mono font-bold border transition-all ${
                isActive
                  ? 'bg-[#0B3027] text-[#F8F6F1] border-[#0B3027] shadow-[0_4px_16px_rgba(11,48,39,0.3)]'
                  : 'bg-[#F8F6F1] text-[#0B3027]/60 border-[#0B3027]/10'
              }`}
            >
              {stage}
            </div>
          );
        })}
      </div>
    </div>
  );
};
