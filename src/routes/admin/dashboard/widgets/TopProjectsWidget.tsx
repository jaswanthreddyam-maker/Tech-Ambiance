import React, { useState, useEffect } from 'react';
import { Briefcase, FolderOpen } from 'lucide-react';
import { ceoDashboardRepository } from '../../../../repositories/ceoDashboardRepository';

const TopProjectsWidget: React.FC = () => {
  const [topProjects, setTopProjects] = useState<any[]>([]);

  useEffect(() => {
    ceoDashboardRepository.getTopProjects().then(setTopProjects);
  }, []);

  return (
    <div className="h-full p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
      <div className="flex items-center justify-between pb-5 border-b border-[#0B3027]/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0B3027] text-[#F8F6F1]">
            <Briefcase className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
              Top Active Projects
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {topProjects.length === 0 ? (
          <div className="text-sm font-mono text-[#0B3027]/50 text-center py-6">No projects projected yet.</div>
        ) : (
          topProjects.map((project, idx) => (
            <div key={project.project_id || idx} className="flex items-center justify-between p-4 rounded-xl border border-[#0B3027]/10 bg-[#F8F6F1]/50 hover:bg-white transition-colors">
              <div className="flex items-center gap-4">
                <FolderOpen className="w-5 h-5 text-[#C9A56A]" />
                <div>
                  <div className="text-sm font-bold text-[#0B3027]">{project.project_name}</div>
                  <div className="text-[10px] font-mono text-[#0B3027]/60 mt-0.5">{project.organization_name} • {project.workspace_name}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs font-bold text-[#0B3027]">{project.lifecycle_stage}</div>
                  <div className="text-[9px] font-mono text-[#0B3027]/40 mt-1 uppercase">Stage</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  project.health_status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' :
                  project.health_status === 'AT_RISK' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {project.health_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

TopProjectsWidget.displayName = 'TopProjectsWidget';
export default TopProjectsWidget;
