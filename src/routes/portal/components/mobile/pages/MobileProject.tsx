import React from 'react';
import { useProjectExperience } from '../../../hooks/portalQueries';
import { useProjectContext } from '../../ProjectContext';
import { PortalDataState } from '../../PortalDataState';
import { Download, ExternalLink, KeyRound } from 'lucide-react';

export const MobileProject: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const { projectExperience, isLoading, error } = useProjectExperience(activeProjectId);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027] mb-2">Project Resources</h2>
      
      <PortalDataState isLoading={isLoading} error={error} isEmpty={!projectExperience}>
        
        {/* Context Summary */}
        <div className="bg-[#0B3027]/5 rounded-2xl p-5 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#0B3027]/50">Health</span>
            <div className="flex gap-2">
              <span className={`w-2 h-2 rounded-full ${projectExperience?.context.projectHealth.budget.color === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`w-2 h-2 rounded-full ${projectExperience?.context.projectHealth.timeline.color === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`w-2 h-2 rounded-full ${projectExperience?.context.projectHealth.scope.color === 'emerald' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#0B3027]/50 mb-1">Target</div>
              <div className="font-bold text-[#0B3027]">{projectExperience?.context.completionEstimate || 'TBD'}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#0B3027]">{projectExperience?.context.progress}%</div>
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0B3027]">Recent Deliverables</h3>
            <span className="text-xs font-mono bg-[#0B3027]/5 px-2 py-1 rounded text-[#0B3027]/60">
              {projectExperience?.deliverablesSummary.count} Total
            </span>
          </div>
          <div className="space-y-3">
            {projectExperience?.deliverablesSummary.recent.map(doc => (
              <a key={doc.id} href={doc.storagePath} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-[#0B3027]/10 rounded-xl flex items-center justify-between group shadow-sm">
                <span className="font-bold text-sm text-[#0B3027] truncate mr-4">{doc.fileName}</span>
                <div className="p-2 bg-[#0B3027]/5 rounded-lg group-hover:bg-[#C9A56A]/10 group-hover:text-[#C9A56A] transition-colors">
                  <Download className="w-4 h-4 text-[#0B3027]/50 group-hover:text-[#C9A56A]" />
                </div>
              </a>
            ))}
          </div>
        </section>
        
        {/* Credentials */}
        {projectExperience?.credentials.length ? (
          <section className="mb-6">
            <h3 className="font-bold text-[#0B3027] mb-4">Credentials</h3>
            <div className="space-y-3">
              {projectExperience.credentials.map(cred => (
                <div key={cred.id} className="p-4 bg-white border border-[#0B3027]/10 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="p-2 bg-[#C9A56A]/10 rounded-lg">
                    <KeyRound className="w-4 h-4 text-[#C9A56A]" />
                  </div>
                  <span className="font-bold text-sm text-[#0B3027] font-mono">{cred.name}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        
        {/* Environments */}
        {projectExperience?.environments.length ? (
          <section className="mb-6">
            <h3 className="font-bold text-[#0B3027] mb-4">Environments</h3>
            <div className="space-y-3">
              {projectExperience.environments.map(env => (
                <a key={env.id} href={env.url} target="_blank" rel="noopener noreferrer" className="p-4 bg-white border border-[#0B3027]/10 rounded-xl flex items-center justify-between group shadow-sm">
                  <div>
                    <span className="font-bold text-sm text-[#0B3027] block mb-1">{env.name}</span>
                    <span className="text-xs text-[#0B3027]/50 font-mono flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${env.status === 'live' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {env.statusLabel}
                    </span>
                  </div>
                  <div className="p-2 bg-[#0B3027]/5 rounded-lg group-hover:bg-[#C9A56A]/10 group-hover:text-[#C9A56A] transition-colors">
                    <ExternalLink className="w-4 h-4 text-[#0B3027]/50 group-hover:text-[#C9A56A]" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}

      </PortalDataState>
    </div>
  );
};
