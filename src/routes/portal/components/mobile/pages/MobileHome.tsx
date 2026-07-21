import React from 'react';
import { useHomeExperience } from '../../../hooks/portalQueries';
import { useProjectContext } from '../../ProjectContext';
import { PortalDataState } from '../../PortalDataState';
import { AlertTriangle, CircleDashed } from 'lucide-react';

export const MobileHome: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const { homeExperience, isLoading, error } = useHomeExperience(activeProjectId);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <PortalDataState isLoading={isLoading} error={error} isEmpty={!homeExperience}>
        
        {/* Mobile Hero */}
        <div className="p-6 rounded-[2rem] bg-[#0B3027] text-[#FAF7F0] shadow-xl relative overflow-hidden">
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold mb-1 relative z-10">
            {homeExperience?.greeting},
          </h2>
          <p className="text-[#FAF7F0]/70 text-sm mb-6 relative z-10">
            <strong className="text-white">{homeExperience?.hero.projectName}</strong>
          </p>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="text-xs text-white/50 mb-1 font-mono uppercase tracking-widest">Stage</div>
              <div className="text-lg font-bold">{homeExperience?.hero.currentStage}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/50 mb-1 font-mono uppercase tracking-widest">Progress</div>
              <div className="text-2xl font-bold">{homeExperience?.hero.progressPercentage}%</div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-4 relative z-10">
            <div 
              className="h-full bg-[#C9A56A] rounded-full transition-all duration-1000"
              style={{ width: `${homeExperience?.hero.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Primary Action */}
        {homeExperience?.primaryAction && (
          <div className="p-5 rounded-2xl bg-[#C9A56A]/10 border border-[#C9A56A]/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#C9A56A]" />
              <h3 className="font-bold text-[#0B3027]">Action Required</h3>
            </div>
            <h4 className="text-lg font-['Cormorant_Garamond'] font-bold text-[#0B3027] mb-4">
              {homeExperience.primaryAction.title}
            </h4>
            <a 
              href={homeExperience.primaryAction.ctaUrl}
              className="block w-full text-center py-3 bg-[#0B3027] text-white rounded-xl font-bold hover:bg-[#0B3027]/90 transition-colors shadow-lg"
            >
              {homeExperience.primaryAction.ctaLabel}
            </a>
          </div>
        )}

        {/* Next Milestone */}
        {homeExperience?.nextMilestone && (
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0B3027]/50 ml-2 mb-3">Up Next</h3>
            <div className="p-4 rounded-2xl bg-white border border-[#0B3027]/10 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-[#0B3027]/5 rounded-xl">
                <CircleDashed className="w-6 h-6 text-[#C9A56A] animate-[spin_4s_linear_infinite]" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0B3027] text-sm">{homeExperience.nextMilestone.title}</h4>
                <div className="text-xs text-[#0B3027]/50 font-mono mt-0.5">
                  Target: {homeExperience.nextMilestone.targetDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#0B3027]">{homeExperience.nextMilestone.daysRemaining}</div>
                <div className="text-[10px] font-mono uppercase text-[#0B3027]/50">Days</div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Important Update */}
        {homeExperience?.latestImportantUpdate && (
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0B3027]/50 ml-2 mb-3">Latest Update</h3>
            <div className="p-4 rounded-2xl bg-white border border-[#0B3027]/10 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-[#0B3027] text-sm">{homeExperience.latestImportantUpdate.title}</h4>
                <span className="text-xs text-[#0B3027]/40 font-mono shrink-0 ml-4">
                  {new Date(homeExperience.latestImportantUpdate.timestamp).toLocaleDateString()}
                </span>
              </div>
              {homeExperience.latestImportantUpdate.description && (
                <p className="text-sm text-[#0B3027]/60 line-clamp-2 mt-1">
                  {homeExperience.latestImportantUpdate.description}
                </p>
              )}
            </div>
          </div>
        )}

      </PortalDataState>
    </div>
  );
};
