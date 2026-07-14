import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom';
import {
  Search,
  LogOut,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CommandPaletteModal } from '../components/admin/CommandPaletteModal';
import { SessionTimeout } from '../auth/SessionTimeout';
import { ceoDashboardRepository } from '../repositories/ceoDashboardRepository';
import { usePermissions } from '../auth/hooks/usePermissions';

import { SIDEBAR_CONFIG } from '../auth/registry/sidebar';


export const StudioHQLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [totalQueue, setTotalQueue] = useState(0);
  const [apiHealthPercent, setApiHealthPercent] = useState(100);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = usePermissions();

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

          {/* Navigation Groups (Filtered strictly by permission) */}
          <div className="space-y-6">
            {SIDEBAR_CONFIG.map((section) => {
              // 1. Filter items by permission strictly
              const visibleItems = section.items.filter(item => can(item.requiredPermission));
              
              // 2. Hide entire section if it's completely empty
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.id}>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C9A56A]/75 px-3.5 mb-2">
                    {section.title}
                  </div>
                  <nav className="space-y-1">
                    {visibleItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <NavLink key={item.id} to={item.href} className={navLinkClasses}>
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>
              );
            })}
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
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/auth/admin');
              }}
              className="p-2 rounded-full bg-white/80 border border-[#0B3027]/10 shadow-sm text-[#0B3027] hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
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

