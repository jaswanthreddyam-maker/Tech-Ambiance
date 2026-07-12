import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Sparkles,
  Globe,
  X,
  ArrowRight,
} from 'lucide-react';
import { workspaceRepository } from '../../repositories/workspaceRepository';
import type { WorkspaceItem } from '../../types/studioHQ';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [isLoadingWs, setIsLoadingWs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setIsLoadingWs(true);
      workspaceRepository.getWorkspaces()
        .then((data) => setWorkspaces(data))
        .catch(() => setWorkspaces([]))
        .finally(() => setIsLoadingWs(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredWorkspaces = workspaces.filter(
    (ws) =>
      ws.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ws.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectWorkspace = (slug?: string) => {
    navigate(slug ? `/admin/workspaces/${slug}` : `/admin/workspaces`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-[#0B3027]/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#F8F6F1] border border-[#C9A56A]/40 rounded-3xl shadow-[0_32px_96px_rgba(11,48,39,0.25)] overflow-hidden">
        {/* Apple Spotlight Search Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#0B3027]/10 bg-white/70 backdrop-blur-md">
          <Search className="w-5 h-5 text-[#C9A56A]" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search Workspaces, CRM Leads, API Endpoints..."
            className="flex-1 bg-transparent text-[#0B3027] placeholder-[#0B3027]/45 text-sm font-medium focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#0B3027]/60 hover:text-[#0B3027] hover:bg-[#0B3027]/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-5">
          {/* Workspaces Section */}
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9A7B4F] px-3 py-1">
              Client Workspaces
            </div>
            <div className="space-y-1.5">
              {isLoadingWs && (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-[#C9A56A] border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-xs text-[#0B3027]/50">Loading workspaces…</span>
                </div>
              )}
              {!isLoadingWs && filteredWorkspaces.length === 0 && (
                <div className="px-4 py-3 text-xs text-[#0B3027]/45">
                  {searchQuery ? 'No workspaces match your search.' : 'No workspaces found.'}
                </div>
              )}
              {!isLoadingWs && filteredWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => handleSelectWorkspace(ws.slug)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/80 hover:bg-white border border-[#0B3027]/8 hover:border-[#C9A56A]/50 shadow-sm hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-[#0B3027]/8 text-[#0B3027]">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#0B3027]">
                        {ws.workspaceName}
                      </div>
                      <div className="text-xs text-[#0B3027]/65">{ws.clientCompany}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#C9A56A]/15 text-[#9A7B4F]">
                      {ws.activeStage}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#C9A56A] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>



          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9A7B4F] px-3 py-1">
              Quick Actions
            </div>
            <div className="space-y-1.5">
              <div
                onClick={() => {
                  navigate('/admin/ai-center');
                  onClose();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/80 hover:bg-white border border-[#0B3027]/8 hover:border-[#C9A56A]/50 shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#0B3027]">
                    Trigger ScoutAI Diagnostic Audit Scan
                  </span>
                </div>
                <span className="text-xs font-mono text-[#9A7B4F]">POST /api/v1/ai/scout/scan</span>
              </div>
              <div
                onClick={() => {
                  navigate('/admin/cms');
                  onClose();
                }}
                className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/80 hover:bg-white border border-[#0B3027]/8 hover:border-[#C9A56A]/50 shadow-sm hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 rounded-xl bg-[#0B3027]/8 text-[#0B3027]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#0B3027]">
                    Open Website Engine CMS Editor (1-Click Rollback)
                  </span>
                </div>
                <span className="text-xs font-mono text-[#9A7B4F]">GET /api/v1/cms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-6 py-3 bg-white/60 border-t border-[#0B3027]/10 flex items-center justify-between text-xs text-[#0B3027]/60">
          <span>Navigate with mouse or keyboard</span>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span>ESC to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
