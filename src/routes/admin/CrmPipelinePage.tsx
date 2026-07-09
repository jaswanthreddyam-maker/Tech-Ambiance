import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { MOCK_CRM_LEADS } from '../../mocks/studioHQ';

export const CrmPipelinePage: React.FC = () => {
  const stages: Array<{
    id: typeof MOCK_CRM_LEADS[number]['pipelineStage'];
    label: string;
    color: string;
  }> = [
    { id: 'LEAD', label: 'New Lead', color: 'border-blue-500/40 text-blue-700 bg-blue-50/50' },
    { id: 'CONTACTED', label: 'Contacted', color: 'border-purple-500/40 text-purple-700 bg-purple-50/50' },
    {
      id: 'MEETING_SCHEDULED',
      label: 'Meeting Booked',
      color: 'border-amber-500/40 text-amber-800 bg-amber-50/50',
    },
    {
      id: 'PROPOSAL_SENT',
      label: 'Proposal Sent',
      color: 'border-indigo-500/40 text-indigo-700 bg-indigo-50/50',
    },
    {
      id: 'NEGOTIATION',
      label: 'Negotiation',
      color: 'border-[#C9A56A]/60 text-[#9A7B4F] bg-[#C9A56A]/10',
    },
    { id: 'WON', label: 'Won Deal', color: 'border-emerald-600/50 text-emerald-800 bg-emerald-50/80' },
    { id: 'LOST', label: 'Lost', color: 'border-red-500/40 text-red-700 bg-red-50/50' },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-6">
        {stages.map((stage) => {
          const leadsInStage = MOCK_CRM_LEADS.filter(
            (lead) => lead.pipelineStage === stage.id
          );

          return (
            <div
              key={stage.id}
              className="min-w-[230px] rounded-3xl bg-white/60 backdrop-blur-md border border-[#0B3027]/10 p-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#0B3027]/10 mb-3.5">
                  <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0B3027]/10 text-[11px] font-mono font-bold text-[#0B3027]">
                    {leadsInStage.length}
                  </span>
                </div>

                <div className="space-y-3.5">
                  {leadsInStage.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-2xl bg-white border border-[#0B3027]/10 hover:border-[#C9A56A]/60 shadow-[0_4px_16px_rgba(11,48,39,0.05)] hover:shadow-md transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-[#C9A56A]/15 text-[10px] font-mono font-bold text-[#9A7B4F]">
                          Score: {lead.telemetryScore}/100
                        </span>
                        <span className="text-[10px] font-mono font-bold text-[#0B3027]/60">
                          {lead.currencyCode}
                        </span>
                      </div>

                      <div className="font-['Cormorant_Garamond'] font-bold text-lg text-[#0B3027] leading-snug">
                        {lead.businessName}
                      </div>

                      <div className="text-xs text-[#0B3027]/65">
                        {lead.industry} • {lead.contactName}
                      </div>

                      <div className="pt-2.5 border-t border-[#0B3027]/8 flex items-center justify-between">
                        <span className="text-sm font-bold font-mono text-emerald-800">
                          {lead.amountFormatted}
                        </span>
                        <FileText className="w-4 h-4 text-[#C9A56A]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {leadsInStage.length === 0 && (
                <div className="py-14 text-center text-xs text-[#0B3027]/35 font-mono">
                  No Leads in Stage
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
