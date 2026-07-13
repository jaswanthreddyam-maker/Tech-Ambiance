import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  KanbanSquare,
  Globe,
  Sparkles,
  FolderKanban,
  Search,
  ShieldCheck,
  Activity,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { CommandPaletteModal } from '../components/admin/CommandPaletteModal';
import { SessionTimeout } from '../auth/SessionTimeout';
import { ceoDashboardRepository } from '../repositories/ceoDashboardRepository';

export const StudioHQLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [totalQueue, setTotalQueue] = useState(0);
  const [apiHealthPercent, setApiHealthPercent] = useState(100);
  
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    // Fetch global operations health to populate top navbar badges
    ceoDashboardRepository.getOperationsHealth().then(healthStats => {
      if (!healthStats || healthStats.length === 0) return;
      
      const queueSize = healthStats.reduce((sum: number, h: any) => sum + (h.outbox_lag || 0), 0);
      setTotalQueue(queueSize);
      
      const healthyCount = healthStats.filter((h: any) => h.status === 'HEALTHY').length;
      setApiHealthPercent(Math.round((healthyCount / healthStats.length) * 100));
    });
  }, []);

  // Keyboard listener for Ctrl + K / Cmd + K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
      isActive
        ? 'bg-[#C9A56A] text-[#08261F] shadow-[0_4px_16px_rgba(201,165,106,0.35)] font-bold'
        : 'text-[#F8F6F1]/75 hover:text-[#F8F6F1] hover:bg-white/[0.07]'
    }`;

  // Get human-readable page title
  const getPageHeading = () => {
    const path = location.pathname;
    if (path.includes('/dashboard') || path === '/admin') return 'Executive Command Dashboard';
    if (path.includes('/timeline')) return 'Studio Activity Timeline Feed';
    if (path.includes('/workspaces')) return 'Client Workspaces Engine';
    if (path.includes('/crm')) return 'Sales CRM & Consultation Pipeline';
    if (path.includes('/cms')) return 'Website Engine Section CMS';
    if (path.includes('/ai-center')) return 'ScoutAI Autonomous Diagnostic Center';
    if (path.includes('/media')) return 'Universal CDN Edge Media Vault';
    if (path.includes('/settings')) return 'Granular 8-Role RBAC & Permissions Matrix';
    return 'StudioHQ Console';
  };

  return (
    <SessionTimeout>
      <div className="min-h-screen bg-[#F8F6F1] text-[#0B3027] font-['Inter'] flex selection:bg-[#C9A56A]/25 selection:text-[#0B3027]">
      {/* Deep Emerald Luxury Sidebar */}
      <aside className="w-68 shrink-0 bg-[#0B3027] text-[#F8F6F1] border-r border-[#C9A56A]/20 p-5 flex flex-col justify-between z-40 shadow-2xl">
        <div className="space-y-7">
          {/* Studio Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C9A56A] shadow-[0_0_10px_rgba(201,165,106,0.8)]" />
                <span className="font-['Cormorant_Garamond'] text-xl font-bold tracking-wide text-[#F8F6F1]">
                  Studio<span className="text-[#C9A56A]">HQ</span>
                </span>
              </div>
              <div className="text-[10px] font-mono tracking-widest text-[#C9A56A]/80 uppercase mt-0.5 pl-4">
                Tech Ambiance OS
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#C9A56A]/15 border border-[#C9A56A]/30 text-[10px] font-mono text-[#C9A56A]">
              v1.0
            </span>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-6">
            {/* Executive Command */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A56A]/75 px-3.5 mb-2">
                Executive Command
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin/dashboard" className={navLinkClasses}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>CEO Dashboard</span>
                </NavLink>
                <NavLink to="/admin/timeline" className={navLinkClasses}>
                  <Clock className="w-4 h-4" />
                  <span>Studio Timeline Feed</span>
                </NavLink>
              </nav>
            </div>

            {/* Workspaces Engine */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A56A]/75 px-3.5 mb-2">
                Workspaces Engine
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin/workspaces" className={navLinkClasses}>
                  <Briefcase className="w-4 h-4" />
                  <span>Client Workspaces</span>
                </NavLink>
              </nav>
            </div>

            {/* Agency Products */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A56A]/75 px-3.5 mb-2">
                Agency Products
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin/crm" className={navLinkClasses}>
                  <KanbanSquare className="w-4 h-4" />
                  <span>Sales CRM Pipeline</span>
                </NavLink>
                <NavLink to="/admin/cms" className={navLinkClasses}>
                  <Globe className="w-4 h-4" />
                  <span>Website Engine (CMS)</span>
                </NavLink>
                <NavLink to="/admin/ai-center" className={navLinkClasses}>
                  <Sparkles className="w-4 h-4" />
                  <span>AI Center (ScoutAI)</span>
                </NavLink>
                <NavLink to="/admin/media" className={navLinkClasses}>
                  <FolderKanban className="w-4 h-4" />
                  <span>Universal Media Vault</span>
                </NavLink>
                <NavLink to="/admin/portfolio" className={navLinkClasses}>
                  <Layers className="w-4 h-4" />
                  <span>Portfolio Manager</span>
                </NavLink>
              </nav>
            </div>

            {/* Core Platform */}
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A56A]/75 px-3.5 mb-2">
                Core Platform
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin/settings" className={navLinkClasses}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>8-Role RBAC & Vaults</span>
                </NavLink>
              </nav>
            </div>
          </div>
        </div>

        {/* User Footer Profile in Sidebar */}
        <div className="pt-4 border-t border-[#C9A56A]/15 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A56A] to-[#A3834C] text-[#08261F] flex items-center justify-center font-bold text-xs shadow-md">
              TA
            </div>
            <div>
              <div className="text-xs font-bold text-[#F8F6F1]">Owner Executive</div>
              <div className="text-[10px] text-[#C9A56A] font-mono">SUPER_ADMIN</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/landing')}
            title="Return to Public Website"
            className="p-2 rounded-lg text-[#C9A56A] hover:bg-white/10 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Warm Ivory Luxury Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F6F1] relative overflow-hidden">
        {/* Soft Radial Ambient Studio Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,165,106,0.08)_0%,_transparent_65%)]" />

        {/* Floating Apple/Arc Style Header Bar */}
        <header className="h-20 px-8 border-b border-[#0B3027]/8 bg-[#F8F6F1]/85 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-6">
          {/* Breadcrumb Title */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#9A7B4F]">
              Tech Ambiance StudioHQ • OS v1.0
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027] tracking-tight">
              {getPageHeading()}
            </h2>
          </div>

          {/* Center Apple Spotlight Search Capsule (Ctrl+K) */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center justify-between w-96 h-10 px-4 rounded-full bg-white/90 border border-[#0B3027]/12 hover:border-[#C9A56A]/60 shadow-[0_2px_12px_rgba(11,48,39,0.04)] hover:shadow-[0_4px_20px_rgba(201,165,106,0.15)] text-xs text-[#0B3027]/60 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-[#C9A56A]" />
              <span className="font-medium">Quick Command or Search...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded-full bg-[#0B3027]/5 text-[10px] font-mono font-semibold text-[#0B3027]/70 border border-[#0B3027]/10">
              Ctrl K
            </kbd>
          </button>

          {/* Minimalist Studio Health Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#0B3027]/10 shadow-sm text-xs font-semibold text-[#0B3027]">
              <span className={`w-2 h-2 rounded-full ${totalQueue > 0 ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>Worker Queue: {totalQueue}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#C9A56A]/30 shadow-sm text-xs font-semibold text-[#9A7B4F]">
              <Activity className="w-3.5 h-3.5 text-[#C9A56A]" />
              <span>API: {apiHealthPercent}%</span>
            </div>
            <button
              onClick={() => navigate('/landing')}
              className="px-4 py-2 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-xs font-semibold text-[#F8F6F1] shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Public Studio</span>
              <span>→</span>
            </button>
          </div>
        </header>

        {/* Page Viewport Area */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Palette Overlay Modal */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
    </SessionTimeout>
  );
};
