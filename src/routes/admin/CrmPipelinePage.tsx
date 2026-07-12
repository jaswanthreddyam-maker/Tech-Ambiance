import React, { useEffect, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import { crmRepository } from '../../repositories/crmRepository';
import type { CrmLead } from '../../repositories/crmRepository';
import { LeadDetailsPanel } from '../../components/admin/LeadDetailsPanel';

export const CrmPipelinePage: React.FC = () => {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);

  // We define the column configuration here for rendering.
  // In a full implementation, this could also be fetched from the database.
  const stages = [
    { id: 'NEW', label: 'New Lead', color: 'border-blue-500/40 text-blue-700 bg-blue-50/50' },
    { id: 'CONTACTED', label: 'Contacted', color: 'border-purple-500/40 text-purple-700 bg-purple-50/50' },
    { id: 'DISCOVERY', label: 'Discovery', color: 'border-indigo-500/40 text-indigo-700 bg-indigo-50/50' },
    { id: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'border-amber-500/40 text-amber-800 bg-amber-50/50' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'border-[#C9A56A]/60 text-[#9A7B4F] bg-[#C9A56A]/10' },
    { id: 'WON', label: 'Won Deal', color: 'border-emerald-600/50 text-emerald-800 bg-emerald-50/80' },
    { id: 'LOST', label: 'Lost', color: 'border-red-500/40 text-red-700 bg-red-50/50' },
  ];

  useEffect(() => {
    // 1. Initial Fetch
    const fetchLeads = async () => {
      try {
        const data = await crmRepository.listLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to load CRM leads:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();

    // 2. Realtime Subscription
    const unsubscribe = crmRepository.watchLeadPipeline(() => {
      // Whenever a postgres change happens, re-fetch to ensure exact snapshot
      // (Optimized for small-to-medium CRMs. For huge datasets, we'd apply payload deltas locally).
      crmRepository.listLeads().then((data) => setLeads(data));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0B3027]/10">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
            Sales CRM & Consultation Acquisition Pipeline
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            7-stage telemetry tracking connected to StrategyConsultationModal & Multi-Currency SOW Generator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-full bg-white border border-[#0B3027]/15 text-xs font-semibold text-[#0B3027] shadow-sm">
            Export Pipeline CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all">
            <Plus className="w-4 h-4 text-[#C9A56A]" />
            <span>Generate Interactive SOW Proposal</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Kanban Board */}
      <div className="flex flex-nowrap gap-4 overflow-x-auto pb-6 custom-scrollbar">
        {stages.map((stage) => {
          const leadsInStage = leads.filter((lead) => lead.status === stage.id);

          return (
            <div
              key={stage.id}
              className="min-w-[280px] shrink-0 rounded-3xl bg-white/60 backdrop-blur-md border border-[#0B3027]/10 p-4 flex flex-col shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#0B3027]/10 mb-3.5">
                  <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${stage.color}`}>
                    {stage.label}
                  </span>
                  {!isLoading && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0B3027]/10 text-[11px] font-mono font-bold text-[#0B3027]">
                      {leadsInStage.length}
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  {isLoading ? (
                    // High-Fidelity Loading Skeletons
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/40 border border-[#0B3027]/5 space-y-3 animate-pulse">
                        <div className="flex justify-between">
                          <div className="w-16 h-4 bg-[#0B3027]/10 rounded-full"></div>
                          <div className="w-8 h-4 bg-[#0B3027]/10 rounded-full"></div>
                        </div>
                        <div className="w-3/4 h-5 bg-[#0B3027]/10 rounded-md"></div>
                        <div className="w-1/2 h-3 bg-[#0B3027]/10 rounded-md"></div>
                      </div>
                    ))
                  ) : (
                    leadsInStage.map((lead) => {
                      const snapshot = lead.consultation_snapshot || {};
                      // Approximate score based on data completeness
                      const score = Math.floor(60 + (snapshot.goals?.length || 0) * 5 + (snapshot.website ? 10 : 0));
                      
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="p-4 rounded-2xl bg-white border border-[#0B3027]/10 hover:border-[#C9A56A]/60 shadow-[0_4px_16px_rgba(11,48,39,0.05)] hover:shadow-md transition-all cursor-pointer space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full bg-[#C9A56A]/15 text-[10px] font-mono font-bold text-[#9A7B4F]">
                              {lead.lead_number || 'LEAD-SYNC'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#0B3027]/60">
                              Score: {score}
                            </span>
                          </div>

                          <div className="font-['Cormorant_Garamond'] font-bold text-lg text-[#0B3027] leading-snug">
                            {lead.business_name}
                          </div>

                          <div className="text-xs text-[#0B3027]/65">
                            {lead.industry} • {lead.contact_name}
                          </div>

                          <div className="pt-2.5 border-t border-[#0B3027]/8 flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-emerald-800">
                              {lead.budget_range}
                            </span>
                            <FileText className="w-4 h-4 text-[#C9A56A]" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {!isLoading && leadsInStage.length === 0 && (
                <div className="py-14 text-center text-xs text-[#0B3027]/35 font-mono">
                  No Leads in Stage
                </div>
              )}
            </div>
          );
        })}
      </div>

      <LeadDetailsPanel 
        lead={selectedLead} 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
      />
    </div>
  );
};
