import React from 'react';
import { useHomeExperience, useUpdatesExperience, useProjectExperience, useBillingExperience } from '../hooks/portalQueries';
import { useProjectContext } from './ProjectContext';
import { PortalDataState } from './PortalDataState';
import { ArrowRight, CircleDashed, Sparkles, AlertTriangle, KeyRound, ExternalLink, Download } from 'lucide-react';
import { useConsultationModal } from '../../../providers/ConsultationModalProvider';

export const DesktopDashboard: React.FC = () => {
  const { activeProjectId } = useProjectContext();
  const { homeExperience, isLoading: isHomeLoading } = useHomeExperience(activeProjectId);
  const { updatesExperience, isLoading: isUpdatesLoading } = useUpdatesExperience(activeProjectId);
  const { projectExperience, isLoading: isProjectLoading } = useProjectExperience(activeProjectId);
  const { billingExperience, isLoading: isBillingLoading } = useBillingExperience();
  const { openConsultationModal } = useConsultationModal();

  if (isHomeLoading || !homeExperience) {
    return (
      <div className="flex justify-center p-20 text-[#0B3027]/50">
        Loading Curated Dashboard...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column (Main Experiences) */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Project Hero */}
        <div className="p-8 rounded-[2rem] bg-[#0B3027] text-[#FAF7F0] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-bold mb-2 relative z-10">
            {homeExperience.greeting},
          </h2>
          <p className="text-[#FAF7F0]/70 text-lg mb-8 relative z-10">
            Here's the latest on <strong className="text-white">{homeExperience.hero.projectName}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="text-sm text-white/50 mb-1 font-mono uppercase tracking-widest">Stage</div>
              <div className="text-xl font-bold">{homeExperience.hero.currentStage}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <div className="text-sm text-white/50 mb-1 font-mono uppercase tracking-widest">Progress</div>
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold">{homeExperience.hero.progressPercentage}%</div>
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C9A56A] rounded-full transition-all duration-1000"
                    style={{ width: `${homeExperience.hero.progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Needs From You */}
        {homeExperience.primaryAction && (
          <div className="p-6 rounded-2xl bg-[#C9A56A]/10 border border-[#C9A56A]/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-[#C9A56A]" />
                  <h3 className="font-bold text-[#0B3027]">Action Required</h3>
                </div>
                <h4 className="text-xl font-['Cormorant_Garamond'] font-bold text-[#0B3027]">
                  {homeExperience.primaryAction.title}
                </h4>
                {homeExperience.primaryAction.description && (
                  <p className="text-[#0B3027]/70 mt-1">
                    {homeExperience.primaryAction.description}
                  </p>
                )}
              </div>
              <a 
                href={homeExperience.primaryAction.ctaUrl}
                className="shrink-0 px-6 py-3 bg-[#0B3027] text-white rounded-xl font-bold hover:bg-[#0B3027]/90 transition-colors shadow-lg"
              >
                {homeExperience.primaryAction.ctaLabel}
              </a>
            </div>
          </div>
        )}

        {/* Secondary Actions */}
        {homeExperience.needsFromYou.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0B3027]/50 ml-2">Also Pending</h3>
            {homeExperience.needsFromYou.map(action => (
              <div key={action.id} className="p-4 rounded-xl bg-white border border-[#0B3027]/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0B3027]">{action.title}</h4>
                  <p className="text-sm text-[#0B3027]/60">{action.description}</p>
                </div>
                <a href={action.ctaUrl} className="text-sm font-bold text-[#C9A56A] hover:underline">
                  {action.ctaLabel}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Next Milestone */}
        {homeExperience.nextMilestone && (
          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#0B3027]/50 ml-2 mb-3">Up Next</h3>
            <div className="p-5 rounded-2xl bg-white border border-[#0B3027]/10 flex items-center gap-4">
              <div className="p-3 bg-[#0B3027]/5 rounded-xl">
                <CircleDashed className="w-6 h-6 text-[#C9A56A] animate-[spin_4s_linear_infinite]" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#0B3027]">{homeExperience.nextMilestone.title}</h4>
                <div className="text-sm text-[#0B3027]/50 font-mono mt-1">
                  Target: {homeExperience.nextMilestone.targetDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#0B3027]">{homeExperience.nextMilestone.daysRemaining}</div>
                <div className="text-xs font-mono uppercase text-[#0B3027]/50">Days Left</div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Updates */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-[#0B3027]/50 ml-2 mb-3">Recent Updates</h3>
          <PortalDataState isLoading={isUpdatesLoading} error={null} isEmpty={!updatesExperience?.feedGroups.length}>
            <div className="space-y-6 pl-4 border-l-2 border-[#0B3027]/10">
              {updatesExperience?.feedGroups.slice(0, 1).map(group => (
                <div key={group.label}>
                  <div className="text-xs font-bold font-mono text-[#0B3027]/40 uppercase mb-4 relative -left-[21px] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0B3027]/20" />
                    {group.label}
                  </div>
                  <div className="space-y-4">
                    {group.items.slice(0, 3).map(item => (
                      <div key={item.id} className="p-4 rounded-xl bg-white border border-[#0B3027]/5 hover:border-[#0B3027]/20 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-[#0B3027]">{item.title}</h4>
                          <span className="text-xs text-[#0B3027]/40 font-mono shrink-0 ml-4">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-[#0B3027]/60">{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PortalDataState>
          <button className="mt-4 text-sm font-bold text-[#C9A56A] flex items-center gap-1 hover:gap-2 transition-all">
            View All Updates <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Right Column (Secondary / Deep Dives) */}
      <div className="space-y-6">
        
        {/* Quick Help */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B3027] to-[#1a4a3e] text-white">
          <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold mb-2">Need Help?</h3>
          <p className="text-white/70 text-sm mb-4">Book a consultation with your project manager.</p>
          <button 
            onClick={() => openConsultationModal()}
            className="w-full py-2.5 bg-white text-[#0B3027] rounded-xl font-bold text-sm hover:bg-[#F8F6F1] transition-colors"
          >
            Book a Sync
          </button>
        </div>

        {/* Resources Summary */}
        <div className="p-6 rounded-2xl bg-white border border-[#0B3027]/10">
          <h3 className="font-bold text-[#0B3027] mb-4">Resources</h3>
          <PortalDataState isLoading={isProjectLoading} error={null} isEmpty={!projectExperience}>
            <div className="space-y-4">
              
              {/* Credentials Preview */}
              {projectExperience?.credentials.length ? (
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#0B3027]/50 mb-2">Credentials</h4>
                  <div className="space-y-2">
                    {projectExperience.credentials.slice(0, 2).map(cred => (
                      <div key={cred.id} className="p-3 bg-[#F8F6F1] rounded-lg flex items-center gap-3">
                        <KeyRound className="w-4 h-4 text-[#C9A56A]" />
                        <span className="font-mono text-sm text-[#0B3027] font-bold">{cred.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Environments Preview */}
              {projectExperience?.environments.length ? (
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#0B3027]/50 mb-2 mt-4">Environments</h4>
                  <div className="space-y-2">
                    {projectExperience.environments.slice(0, 2).map(env => (
                      <a key={env.id} href={env.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#F8F6F1] rounded-lg flex items-center justify-between group hover:bg-[#0B3027]/5 transition-colors">
                        <span className="font-bold text-sm text-[#0B3027]">{env.name}</span>
                        <ExternalLink className="w-4 h-4 text-[#0B3027]/30 group-hover:text-[#C9A56A]" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Deliverables Preview */}
              {projectExperience?.deliverablesSummary.recent.length ? (
                <div>
                  <h4 className="text-xs font-mono uppercase text-[#0B3027]/50 mb-2 mt-4">Recent Deliverables</h4>
                  <div className="space-y-2">
                    {projectExperience.deliverablesSummary.recent.slice(0, 3).map(doc => (
                      <a key={doc.id} href={doc.storagePath} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#F8F6F1] rounded-lg flex items-center justify-between group hover:bg-[#0B3027]/5 transition-colors">
                        <span className="font-bold text-sm text-[#0B3027] truncate mr-4">{doc.fileName}</span>
                        <Download className="w-4 h-4 text-[#0B3027]/30 group-hover:text-[#C9A56A] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

            </div>
          </PortalDataState>
        </div>

        {/* Billing Summary */}
        <div className="p-6 rounded-2xl bg-white border border-[#0B3027]/10">
          <h3 className="font-bold text-[#0B3027] mb-4">Billing Status</h3>
          <PortalDataState isLoading={isBillingLoading} error={null} isEmpty={!billingExperience}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-xs font-mono uppercase text-[#0B3027]/50 mb-1">Total Outstanding</div>
                <div className="text-2xl font-bold text-[#0B3027] font-mono">{billingExperience?.summary.totalOutstanding}</div>
              </div>
            </div>
            {billingExperience?.pendingInvoices.slice(0, 2).map(inv => (
              <div key={inv.id} className="p-3 bg-[#F8F6F1] rounded-lg flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-sm text-[#0B3027]">{inv.title}</div>
                  {inv.dueDate && <div className="text-xs text-[#0B3027]/50 font-mono mt-0.5">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>}
                </div>
                <div className="text-sm font-bold font-mono text-[#0B3027]">{inv.formattedAmount}</div>
              </div>
            ))}
          </PortalDataState>
        </div>

      </div>
    </div>
  );
};
