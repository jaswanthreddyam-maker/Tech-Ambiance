import React, { useState } from 'react';
import {
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  MOCK_WORKSPACES,
  MOCK_LINEAR_TASKS,
  MOCK_CREDENTIALS_VAULT,
} from '../../mocks/studioHQ';

export const WorkspacesPage: React.FC = () => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('ws-1');
  const [revealedCredId, setRevealedCredId] = useState<string | null>(null);

  const currentWorkspace =
    MOCK_WORKSPACES.find((ws) => ws.id === selectedWorkspaceId) || MOCK_WORKSPACES[0];

  const tasksForWorkspace = MOCK_LINEAR_TASKS.filter(
    (t) => t.workspaceId === currentWorkspace.id || currentWorkspace.id === 'ws-1'
  );

  const toggleCredentialVisibility = (id: string) => {
    setRevealedCredId((prev) => (prev === id ? null : id));
  };

  const stages = [
    'DISCOVERY',
    'DESIGN',
    'DEVELOPMENT',
    'TESTING',
    'DEPLOYMENT',
    'MAINTENANCE',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0B3027]/10">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
            Client Workspaces Directory
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            Multi-tenant workspace containers tracking projects, Linear-grade engineering tasks, and encrypted credentials.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all">
          <Plus className="w-4 h-4 text-[#C9A56A]" />
          <span>Create Client Workspace</span>
        </button>
      </div>

      {/* Workspaces Directory Cards - Floating Frosted Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {MOCK_WORKSPACES.map((ws) => {
          const isSelected = ws.id === selectedWorkspaceId;
          return (
            <div
              key={ws.id}
              onClick={() => setSelectedWorkspaceId(ws.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-white border-[#0B3027] shadow-[0_12px_36px_rgba(11,48,39,0.14)] ring-2 ring-[#C9A56A]/50'
                  : 'bg-white/75 hover:bg-white border-[#C9A56A]/25 hover:border-[#C9A56A]/60 shadow-[0_6px_20px_rgba(11,48,39,0.05)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C9A56A]/15 text-[#9A7B4F]">
                  {ws.activeStage}
                </span>
                <Briefcase className="w-4 h-4 text-[#C9A56A]" />
              </div>
              <div className="font-['Cormorant_Garamond'] font-bold text-xl text-[#0B3027] mt-3">
                {ws.workspaceName}
              </div>
              <div className="text-xs text-[#0B3027]/65 mt-1">{ws.clientCompany}</div>
              <div className="text-[11px] text-[#9A7B4F] mt-3 font-mono font-semibold">
                {ws.primaryContactName}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Workspace Deep-Dive Container */}
      <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/30 shadow-[0_12px_40px_rgba(11,48,39,0.08)] space-y-8">
        {/* Workspace Title + 6-Stage Project Lifecycle Bar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027]">
                {currentWorkspace.workspaceName}
              </h2>
              <div className="text-xs text-[#0B3027]/65">
                Primary Contact: {currentWorkspace.primaryContactEmail}
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-600/10 border border-emerald-600/25 text-xs font-mono font-bold text-emerald-800">
              STATUS: {currentWorkspace.status}
            </span>
          </div>

          {/* 6-Stage Pipeline Visualizer */}
          <div className="grid grid-cols-6 gap-2.5 pt-4">
            {stages.map((stage) => {
              const isActive = currentWorkspace.activeStage === stage;
              return (
                <div
                  key={stage}
                  className={`py-3 px-2 rounded-xl text-center text-[10px] font-mono font-bold border transition-all ${
                    isActive
                      ? 'bg-[#0B3027] text-[#F8F6F1] border-[#0B3027] shadow-[0_4px_16px_rgba(11,48,39,0.3)]'
                      : 'bg-[#F8F6F1] text-[#0B3027]/60 border-[#0B3027]/10'
                  }`}
                >
                  {stage}
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Environment URLs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-[#9A7B4F]">
                DEV ENVIRONMENT
              </div>
              <div className="text-xs text-[#0B3027] font-mono font-semibold mt-1">
                dev.cafevistaara.techambiance.app
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#0B3027]/50" />
          </div>
          <div className="p-5 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-amber-700">
                STAGING ENVIRONMENT
              </div>
              <div className="text-xs text-[#0B3027] font-mono font-semibold mt-1">
                staging.cafevistaara.com
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-700/60" />
          </div>
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-600/30 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">
                PRODUCTION FLAGSHIP
              </div>
              <div className="text-xs text-[#0B3027] font-mono font-semibold mt-1">
                cafevistaara.com
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-700" />
          </div>
        </div>

        {/* Linear-Style Tasks & Milestones Board */}
        <div>
          <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027] mb-4">
            Linear-Grade Engineering Tasks
          </h3>
          <div className="space-y-3">
            {tasksForWorkspace.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#F8F6F1] border border-[#0B3027]/10 hover:border-[#C9A56A]/50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      t.status === 'DONE'
                        ? 'bg-emerald-600'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-bold text-[#0B3027]">
                      {t.title}
                    </div>
                    <div className="text-xs text-[#0B3027]/60">
                      Assignee: {t.assigneeName} • Due: {t.dueDate}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-white border border-[#0B3027]/10 text-[#0B3027]/80">
                    {t.priority}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#C9A56A]/15 text-[#9A7B4F] border border-[#C9A56A]/35">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AES-256-GCM Encrypted Credentials Vault */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <KeyRound className="w-5 h-5 text-[#C9A56A]" />
            <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">
              Encrypted Credentials Vault (`workspace_credentials`)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MOCK_CREDENTIALS_VAULT.map((cred) => {
              const isRevealed = revealedCredId === cred.id;
              return (
                <div
                  key={cred.id}
                  className="p-5 rounded-2xl bg-[#0B3027] text-[#F8F6F1] border border-[#C9A56A]/30 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F8F6F1]">
                      {cred.serviceName}
                    </span>
                    <button
                      onClick={() => toggleCredentialVisibility(cred.id)}
                      className="text-[#C9A56A] hover:text-white transition-all"
                    >
                      {isRevealed ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-[#F8F6F1]/70">
                    User: {cred.usernameOrEmail}
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/40 text-[11px] font-mono break-all text-[#C9A56A]">
                    {isRevealed ? 'AES256_DECRYPTED_SECRET_KEY_PROD' : cred.maskedPayload}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
