import React from 'react';
import { useUpdatesExperience } from '../../../hooks/portalQueries';
import { useProjectContext } from '../../ProjectContext';
import { PortalDataState } from '../../PortalDataState';

export const MobileUpdates: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const { updatesExperience, isLoading, error } = useUpdatesExperience(activeProjectId);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027] mb-2">Project Feed</h2>
      
      <PortalDataState isLoading={isLoading} error={error} isEmpty={!updatesExperience?.feedGroups.length}>
        <div className="space-y-8 pl-4 border-l-2 border-[#0B3027]/10">
          {updatesExperience?.feedGroups.map(group => (
            <div key={group.label}>
              <div className="text-xs font-bold font-mono text-[#0B3027]/40 uppercase mb-4 relative -left-[21px] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0B3027]/20" />
                {group.label}
              </div>
              <div className="space-y-4">
                {group.items.map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-white border border-[#0B3027]/5 shadow-sm relative">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-[#0B3027] text-sm">{item.title}</h4>
                      <span className="text-xs text-[#0B3027]/40 font-mono shrink-0 ml-4">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-[#0B3027]/60 mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PortalDataState>
    </div>
  );
};
