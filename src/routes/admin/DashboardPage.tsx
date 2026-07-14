import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Briefcase,
  Sparkles,
  Terminal,
  Globe,
  Plus,
  DollarSign,
  Activity,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { ceoDashboardRepository } from '../../repositories/ceoDashboardRepository';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [finance, setFinance] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [crm, setCrm] = useState<any>(null);
  const [topProjects, setTopProjects] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const csvContent = await ceoDashboardRepository.getExecutiveReport();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `executive-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export report:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    // Independent widget loading
    ceoDashboardRepository.getFinanceMetrics().then(setFinance);
    ceoDashboardRepository.getDeliveryMetrics().then(setDelivery);
    ceoDashboardRepository.getCrmMetrics().then(setCrm);
    ceoDashboardRepository.getTopProjects().then(setTopProjects);
    ceoDashboardRepository.getStudioTimeline().then(setTimeline);
    ceoDashboardRepository.getOperationsHealth().then(setHealth);

    const channel = ceoDashboardRepository.initializeRealtime({
      onFinanceUpdate: setFinance,
      onDeliveryUpdate: setDelivery,
      onCrmUpdate: setCrm,
      onTimelineUpdate: (newEvent) => setTimeline(prev => [newEvent, ...prev].slice(0, 10))
    });

    return () => {
      ceoDashboardRepository.disposeRealtime(channel);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold tracking-tight text-[#0B3027]">
            Executive Read Model
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            CQRS real-time projections across Finance, Delivery, CRM, and Operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            disabled={isExporting}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-white/90 border border-[#0B3027]/15 text-xs font-semibold text-[#0B3027] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Generating...' : 'Export SOW Executive Report'}
          </button>
          <button
            onClick={() => navigate('/admin/workspaces', { state: { openProvisionWizard: true } })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all"
          >
            <Plus className="w-4 h-4 text-[#C9A56A]" />
            <span>Provision Client Workspace</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Finance */}
        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>MONTHLY REVENUE (USD)</span>
            <DollarSign className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
            {finance ? `$${finance.monthly_revenue?.toLocaleString() || 0}` : '---'}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#0B3027]/5">
            <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
              COLLECTED: <span className="text-[#0B3027]">${finance?.cash_collected_this_month?.toLocaleString() || 0}</span>
            </div>
            <div className="text-[10px] font-mono font-bold text-amber-700">
              OVERDUE: {finance?.overdue_invoice_count || 0}
            </div>
          </div>
        </div>

        {/* CRM */}
        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>CRM PIPELINE VALUE</span>
            <TrendingUp className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
            {crm ? `$${crm.pipeline_value?.toLocaleString() || 0}` : '---'}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#0B3027]/5">
             <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
              OPEN DEALS: <span className="text-[#0B3027]">{crm?.open_deals || 0}</span>
            </div>
             <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
              WON: <span className="text-emerald-700">{crm?.deals_won || 0}</span>
            </div>
          </div>
        </div>

        {/* Scout AI */}
        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>SCOUT AI TELEMETRY</span>
            <Sparkles className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027]/40 mt-3 italic">
            UNAVAILABLE
          </div>
          <div className="text-[10px] font-mono text-[#0B3027]/50 mt-3 pt-3 border-t border-[#0B3027]/5 font-bold uppercase tracking-widest">
            Awaiting Worker Node Sync
          </div>
        </div>

        {/* Delivery Overview */}
        <div className="p-6 rounded-2xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)] transition-all">
          <div className="flex items-center justify-between text-xs text-[#9A7B4F] font-mono uppercase tracking-wider font-bold">
            <span>DELIVERY VELOCITY</span>
            <Activity className="w-4 h-4 text-[#C9A56A]" />
          </div>
          <div className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027] mt-3">
            {delivery ? `${delivery.average_milestone_completion_days || 0} Days` : '---'}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#0B3027]/5">
            <div className="text-[10px] font-mono font-bold text-[#0B3027]/60">
              ACTIVE WS: <span className="text-[#0B3027]">{delivery?.active_workspaces || 0}</span>
            </div>
            {delivery?.projects_at_risk > 0 && (
              <div className="text-[10px] font-mono font-bold text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {delivery.projects_at_risk} AT RISK
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Split Layout: Projects + Timeline + Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Top Projects */}
          <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
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

          {/* Timeline Feed */}
          <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
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
                    Real-time domain events (`studio_activity_projection`)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#9A7B4F] bg-[#C9A56A]/15 px-3 py-1.5 rounded-full border border-[#C9A56A]/30 font-semibold">
                CQRS Feed Active
              </span>
            </div>

            <div className="space-y-6">
              {timeline.length === 0 ? (
                <div className="text-sm font-mono text-[#0B3027]/50 text-center py-6">No events processed yet.</div>
              ) : (
                timeline.map((event, idx) => (
                  <div key={event.id || idx} className="flex items-start gap-4 group">
                    <div className="relative flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 shadow-sm mt-1.5 ${
                        event.severity === 'WARNING' ? 'bg-amber-500 border-amber-700' : 
                        event.severity === 'ERROR' ? 'bg-red-500 border-red-700' : 'bg-[#0B3027] border-[#C9A56A]'
                      }`} />
                      {idx < timeline.length - 1 && (
                        <div className="w-0.5 h-14 bg-[#0B3027]/15 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-5 border-b border-[#0B3027]/8 group-last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#0B3027]">
                          {event.event_type}
                        </span>
                        <span className="text-xs text-[#0B3027]/50 font-mono">
                          {new Date(event.created_at || event.event_timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#0B3027]/75 mt-1 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2.5 mt-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0B3027]/10 text-[#0B3027]">
                          {event.tag || event.source_context}
                        </span>
                        {event.actor_name && (
                          <span className="text-[10px] font-mono font-bold text-[#0B3027]/40">
                            By {event.actor_name}
                          </span>
                        )}
                        {event.organization_name && (
                           <span className="text-[10px] font-mono font-bold text-[#0B3027]/40">
                            • {event.organization_name}
                           </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <div className="p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 shadow-[0_8px_30px_rgba(11,48,39,0.06)]">
            <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027] mb-4">
              Operations Health
            </h3>
            <div className="space-y-3 text-xs">
              {health.length === 0 ? (
                <div className="text-sm font-mono text-[#0B3027]/50 text-center py-2">Loading...</div>
              ) : health.map(h => (
                <div key={h.context_name} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/8">
                  <div>
                    <div className="text-[#0B3027] font-semibold">{h.context_name}</div>
                    <div className="text-[9px] font-mono text-[#0B3027]/50 mt-1">
                      {h.outbox_lag > 0 ? `Lag: ${h.outbox_lag}` : 'Lag: 0'}
                    </div>
                  </div>
                  <span className={`font-mono font-bold ${
                    h.status === 'HEALTHY' ? 'text-emerald-700' :
                    h.status === 'WARNING' ? 'text-amber-600' : 'text-red-600'
                  }`}>{h.status}</span>
                </div>
              ))}
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
