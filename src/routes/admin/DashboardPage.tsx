import React from 'react';
import {
  TrendingUp,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Terminal,
  Globe,
  Plus,
} from 'lucide-react';
import { MOCK_STUDIO_TIMELINE, MOCK_WORKSPACES } from '../../mocks/studioHQ';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold tracking-tight text-[#0B3027]">
            Executive Studio Overview
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            Real-time telemetry, client workspaces, and autonomous ScoutAI diagnostics across StudioHQ.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-full bg-white hover:bg-white/90 border border-[#0B3027]/15 text-xs font-semibold text-[#0B3027] shadow-sm transition-all">
            Export SOW Executive Report
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all">
            <Plus className="w-4 h-4 text-[#C9A56A]" />
            <span>Provision Client Workspace</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Apple + Stripe Floating Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-[0_16px_40px_rgba(11,48,39,0.10)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>MONTHLY REVENUE (USD)</span>
            <TrendingUp className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
            $48,500
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2% YoY growth</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-[0_16px_40px_rgba(11,48,39,0.10)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>ACTIVE FLAGSHIP WORKSPACES</span>
            <Briefcase className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
            {MOCK_WORKSPACES.length}
          </div>
          <div className="text-xs text-[#0B3027]/70 mt-2">
            Cafe Vistaara, CoffyMine & BrewBakes
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-[0_16px_40px_rgba(11,48,39,0.10)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>SCOUT AI TELEMETRY SCORE</span>
            <Sparkles className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-emerald-700 mt-3">
            86.4 / 100
          </div>
          <div className="text-xs text-[#0B3027]/70 mt-2">
            WCAG AA & Lighthouse Verified
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-[0_16px_40px_rgba(11,48,39,0.10)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>PLATFORM ENCRYPTION</span>
            <ShieldCheck className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027] mt-3">
            AES-256-GCM
          </div>
          <div className="text-xs text-[#0B3027]/70 mt-2">
            8-Role RBAC Active Matrix
          </div>
        </div>
      </div>

      {/* Main Split Layout: Studio Activity Feed + Observability */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Apple-Grade Studio Activity Feed */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
          <div className="flex items-center justify-between pb-5 border-b border-[#0B3027]/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#0B3027] text-[#F8F6F1]">
                <Terminal className="w-4 h-4 text-[#C9A56A]" />
              </div>
              <div>
                <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
                  Global Studio Timeline
                </h2>
                <p className="text-xs text-[#0B3027]/60">
                  Real-time outbox domain events (`studio_events`)
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#9A7B4F] bg-[#C9A56A]/15 px-3 py-1.5 rounded-full border border-[#C9A56A]/30 font-semibold">
              Transactional Outbox Active
            </span>
          </div>

          <div className="space-y-6">
            {MOCK_STUDIO_TIMELINE.map((event, idx) => (
              <div key={event.id} className="flex items-start gap-4 group">
                <div className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#0B3027] border-2 border-[#C9A56A] shadow-sm mt-1.5" />
                  {idx < MOCK_STUDIO_TIMELINE.length - 1 && (
                    <div className="w-0.5 h-14 bg-[#0B3027]/15 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-5 border-b border-[#0B3027]/8 group-last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0B3027]">
                      {event.title}
                    </span>
                    <span className="text-xs text-[#0B3027]/50 font-mono">
                      {event.timestampLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#0B3027]/75 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2.5 mt-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0B3027]/10 text-[#0B3027]">
                      {event.tag}
                    </span>
                    <span className="text-[10px] font-mono text-[#0B3027]/40">
                      {event.eventKey}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observability & Rollback Container */}
        <div className="space-y-6">
          <div className="p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
            <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027] mb-4">
              Bounded Context Health
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/8">
                <span className="text-[#0B3027] font-semibold">/api/v1/workspaces</span>
                <span className="text-emerald-700 font-mono font-bold">100% HEALTHY</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/8">
                <span className="text-[#0B3027] font-semibold">/api/v1/crm (Leads & SOW)</span>
                <span className="text-emerald-700 font-mono font-bold">100% HEALTHY</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/8">
                <span className="text-[#0B3027] font-semibold">/api/v1/cms (Snapshot Engine)</span>
                <span className="text-emerald-700 font-mono font-bold">100% HEALTHY</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/8">
                <span className="text-[#0B3027] font-semibold">/api/v1/ai (ScoutAI Audit)</span>
                <span className="text-emerald-700 font-mono font-bold">100% HEALTHY</span>
              </div>
            </div>
          </div>

          <div className="p-7 rounded-3xl bg-[#0B3027] text-[#F8F6F1] border border-[#C9A56A]/30 shadow-xl">
            <div className="flex items-center gap-2 text-[#C9A56A] font-semibold text-xs uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4" />
              <span>Website Engine (CMS)</span>
            </div>
            <h4 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#F8F6F1]">
              1-Click Version Rollback Ready
            </h4>
            <p className="text-xs text-[#F8F6F1]/80 mt-2 leading-relaxed">
              Every content change creates an immutable schema snapshot (`v1`, `v2`). Inspect line-by-line diffs before edge deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
