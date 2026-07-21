import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Briefcase,
  KeyRound,
  Eye,
  EyeOff,
  ExternalLink,
  Plus,
  Activity,
  Copy, 
  Check, 
  Building2,
  ChevronDown,
  ChevronRight,
  FolderOpen
} from 'lucide-react';
import { workspaceRepository } from '../../repositories/workspaceRepository';
import { agencyOsService, type LifecycleStage } from '../../api/agencyOsService';
import { supabase } from '../../lib/supabase';
import type { 
  OrganizationHierarchy,
  ProjectEnvironment, 
  ProjectTask, 
  ProjectActivityEvent,
  ProjectCredential
} from '../../types/studioHQ';
import { CreateTaskPanel } from '../../components/admin/CreateTaskPanel';
import { ProvisionClientWizard } from './components/ProvisionClientWizard';
import { ActionButton } from '../../components/admin/ActionButton';

export const WorkspacesPage: React.FC = () => {
  const location = useLocation();
  const [organizations, setOrganizations] = useState<OrganizationHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actorId, setActorId] = useState<string>('');
  
  // Selection State (Expandable Hierarchy)
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set());
  const [expandedWorkspaceIds, setExpandedWorkspaceIds] = useState<Set<string>>(new Set());
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Add Project State
  const [addProjectWorkspaceId, setAddProjectWorkspaceId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Project Deep-Dive State
  const [environments, setEnvironments] = useState<ProjectEnvironment[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [activities, setActivities] = useState<ProjectActivityEvent[]>([]);
  const [credentials, setCredentials] = useState<ProjectCredential[]>([]);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});
  const [copiedCredId, setCopiedCredId] = useState<string | null>(null);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setActorId(data.user?.id || ''));
  }, []);

  // Read React Router state for auto-opening the wizard from Dashboard
  useEffect(() => {
    const state = location.state as { openProvisionWizard?: boolean } | null;
    if (state?.openProvisionWizard) {
      setIsWizardOpen(true);
      // Clear the state so refreshing doesn't re-open
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const data = await workspaceRepository.getOrganizationHierarchy();
      setOrganizations(data);
    } catch (err) {
      console.error("Failed to load organizations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleAddProject = async (workspaceId: string) => {
    if (!newProjectName.trim() || !actorId) return;
    setIsCreatingProject(true);
    try {
      await workspaceRepository.createProject({
        workspace_id: workspaceId,
        name: newProjectName.trim(),
        actor_id: actorId,
      });
      setAddProjectWorkspaceId(null);
      setNewProjectName('');
      fetchOrganizations(); // Refresh hierarchy
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Check console.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Focused Load of Project Data
  useEffect(() => {
    if (!activeProjectId) return;

    let unsubscribeProject = () => {};

    // Clear old project state
    setEnvironments([]);
    setTasks([]);
    setActivities([]);
    setCredentials([]);

    const loadProjectData = async () => {
      // Parallel load of deep-dive data
      const [envs, tsks, acts, creds] = await Promise.all([
        workspaceRepository.getProjectEnvironments(activeProjectId),
        workspaceRepository.getProjectTasks(activeProjectId),
        workspaceRepository.getProjectActivity(activeProjectId),
        workspaceRepository.getProjectCredentials(activeProjectId)
      ]);
      
      setEnvironments(envs);
      setTasks(tsks);
      setActivities(acts);
      setCredentials(creds);

      unsubscribeProject = workspaceRepository.watchProject(activeProjectId, () => {
        Promise.all([
          workspaceRepository.getProjectEnvironments(activeProjectId),
          workspaceRepository.getProjectTasks(activeProjectId),
          workspaceRepository.getProjectActivity(activeProjectId),
          workspaceRepository.getProjectCredentials(activeProjectId)
        ]).then(([newEnvs, newTsks, newActs, newCreds]) => {
          setEnvironments(newEnvs);
          setTasks(newTsks);
          setActivities(newActs);
          setCredentials(newCreds);
        });
      });
    };

    loadProjectData();

    return () => {
      unsubscribeProject();
    };
  }, [activeProjectId]);

  const toggleOrg = (id: string) => {
    setExpandedOrgIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStageChange = async (newStage: string) => {
    if (!activeProjectId || !actorId) return;
    try {
      await agencyOsService.delivery.updateProjectLifecycleStage(
        activeProjectId,
        newStage as LifecycleStage,
        actorId
      );
      fetchOrganizations(); // Refresh hierarchy
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  const handleRevealCredential = async (credId: string) => {
    if (revealedSecrets[credId]) {
      setRevealedSecrets(prev => {
        const next = { ...prev };
        delete next[credId];
        return next;
      });
      return;
    }
    try {
      const result = await workspaceRepository.revealCredentialSecret(credId, actorId);
      if (result) {
        setRevealedSecrets(prev => ({ ...prev, [credId]: result.secret_value }));
        setTimeout(() => {
          setRevealedSecrets(prev => {
            const next = { ...prev };
            delete next[credId];
            return next;
          });
        }, result.reveal_token_expires_in * 1000);
      }
    } catch (err) {
      alert("Unauthorized to reveal this credential.");
    }
  };

  const handleCopyCredential = async (credId: string, secretValue: string) => {
    navigator.clipboard.writeText(secretValue);
    setCopiedCredId(credId);
    await workspaceRepository.recordCredentialCopied(credId, actorId);
    setTimeout(() => setCopiedCredId(null), 2000);
  };

  const groupedCredentials = credentials.reduce((acc, cred) => {
    if (!acc[cred.category]) acc[cred.category] = [];
    acc[cred.category].push(cred);
    return acc;
  }, {} as Record<string, ProjectCredential[]>);

  const stages = ['DISCOVERY', 'DESIGN', 'DEVELOPMENT', 'TESTING', 'DEPLOYMENT', 'MAINTENANCE'];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0B3027]/10">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
            Organizations Directory
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            Enterprise multi-tenant containers tracking organizations, workspaces, projects, and vault credentials.
          </p>
        </div>
        <ActionButton 
          actionId="workspace.provision"
          onAction={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0B3027] hover:bg-[#0E3A2F] text-white font-semibold text-xs shadow-[0_4px_16px_rgba(11,48,39,0.25)] transition-all"
        >
          <Plus className="w-4 h-4 text-[#C9A56A]" />
          <span>Activate Client</span>
        </ActionButton>
      </div>

      {/* Organizations Directory */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[#0B3027]/5 bg-white/40 animate-pulse h-[100px]" />
          ))
        ) : organizations.length === 0 ? (
          <div className="py-12 text-center text-[#0B3027]/50 font-mono text-sm border-2 border-dashed border-[#0B3027]/10 rounded-3xl">
            No active organizations found. Click 'Activate Client' to provision one manually.
          </div>
        ) : (
          organizations.map((org) => {
            const isOrgExpanded = expandedOrgIds.has(org.id);
            const totalWorkspaces = org.workspaces.length;
            const totalProjects = org.workspaces.reduce((acc, ws) => acc + ws.projects.length, 0);
            
            return (
              <div key={org.id} className="rounded-2xl border border-[#0B3027]/10 bg-white/60 overflow-hidden shadow-sm transition-all hover:shadow-md">
                {/* Organization Header */}
                <div 
                  onClick={() => toggleOrg(org.id)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0B3027]/5 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#0B3027]" />
                    </div>
                    <div>
                      <h3 className="font-['Cormorant_Garamond'] text-2xl font-bold text-[#0B3027]">{org.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#0B3027]/60">
                        <span>{org.business_category || 'General'}</span>
                        <span>•</span>
                        <span>Primary Contact: {org.primary_contact_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C9A56A]/10 text-[#0B3027]">
                        {totalProjects} Projects
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C9A56A]/10 text-[#0B3027]">
                        {totalWorkspaces} Workspaces
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-600/10 text-emerald-800">
                        ACTIVE
                      </span>
                    </div>
                    {isOrgExpanded ? <ChevronDown className="w-5 h-5 text-[#0B3027]/40" /> : <ChevronRight className="w-5 h-5 text-[#0B3027]/40" />}
                  </div>
                </div>

                {/* Workspaces Nested List */}
                {isOrgExpanded && (
                  <div className="border-t border-[#0B3027]/5 bg-[#F8F6F1]/50 p-4 pl-12 space-y-3">
                    {org.workspaces.map(ws => {
                      const isWsExpanded = expandedWorkspaceIds.has(ws.id);
                      return (
                        <div key={ws.id} className="rounded-xl border border-[#0B3027]/10 bg-white overflow-hidden shadow-sm">
                          <div 
                            onClick={() => toggleWorkspace(ws.id)}
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#0B3027]/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Briefcase className="w-4 h-4 text-[#C9A56A]" />
                              <h4 className="font-bold text-[#0B3027] text-sm">{ws.name}</h4>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-mono text-[#0B3027]/50">{ws.projects.length} Projects</span>
                              {isWsExpanded ? <ChevronDown className="w-4 h-4 text-[#0B3027]/40" /> : <ChevronRight className="w-4 h-4 text-[#0B3027]/40" />}
                            </div>
                          </div>

                          {/* Projects Nested List */}
                          {isWsExpanded && (
                            <div className="border-t border-[#0B3027]/5 bg-[#F8F6F1] p-3 space-y-2">
                              {ws.projects.map(proj => {
                                const isProjActive = activeProjectId === proj.id;
                                return (
                                  <div 
                                    key={proj.id}
                                    onClick={() => setActiveProjectId(proj.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                      isProjActive 
                                        ? 'bg-[#0B3027] text-white border-[#0B3027] shadow-md' 
                                        : 'bg-white text-[#0B3027] hover:border-[#C9A56A]/50 border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <FolderOpen className={`w-4 h-4 ${isProjActive ? 'text-[#C9A56A]' : 'text-[#0B3027]/40'}`} />
                                      <div>
                                        <div className="text-sm font-bold">{proj.name}</div>

                                      </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                                      isProjActive ? 'bg-white/20 text-white' : 'bg-[#C9A56A]/10 text-[#9A7B4F]'
                                    }`}>
                                      {proj.lifecycle_stage}
                                    </span>
                                  </div>
                                );
                              })}
                              
                              {/* Add Project Button */}
                              {addProjectWorkspaceId === ws.id ? (
                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="text"
                                    autoFocus
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleAddProject(ws.id); if (e.key === 'Escape') { setAddProjectWorkspaceId(null); setNewProjectName(''); } }}
                                    placeholder="Project name..."
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#0B3027]/15 text-xs bg-white focus:outline-none focus:border-[#C9A56A]"
                                  />
                                  <button
                                    onClick={() => handleAddProject(ws.id)}
                                    disabled={isCreatingProject || !newProjectName.trim()}
                                    className="px-3 py-1.5 rounded-lg bg-[#0B3027] text-white text-xs font-bold hover:bg-[#0E3A2F] disabled:opacity-50 transition-colors"
                                  >
                                    {isCreatingProject ? '...' : 'Add'}
                                  </button>
                                  <button
                                    onClick={() => { setAddProjectWorkspaceId(null); setNewProjectName(''); }}
                                    className="px-2 py-1.5 rounded-lg text-[#0B3027]/50 hover:bg-[#0B3027]/5 text-xs font-bold transition-colors"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setAddProjectWorkspaceId(ws.id)}
                                  className="w-full flex items-center justify-center gap-2 p-2 mt-2 rounded-lg border border-dashed border-[#0B3027]/20 text-[#0B3027]/60 hover:bg-[#0B3027]/5 transition-colors text-xs font-bold"
                                >
                                  <Plus className="w-3 h-3" /> Add Project
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Project Deep-Dive Container */}
      {activeProjectId && (
      <div className="p-8 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/30 shadow-[0_12px_40px_rgba(11,48,39,0.08)] space-y-12">
        {/* Project Title + 6-Stage Project Lifecycle Bar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-['Cormorant_Garamond'] text-3xl font-bold text-[#0B3027]">
                Project Details
              </h2>
            </div>
          </div>

          {/* 6-Stage Pipeline Visualizer */}
          <div className="grid grid-cols-6 gap-2.5 pt-4">
            {stages.map((stage) => {
              // We'd need to find the active stage from the selected project in the hierarchy
              // But for brevity, if it matches...
              let isActive = false;
              organizations.forEach(o => o.workspaces.forEach(w => w.projects.forEach(p => {
                if (p.id === activeProjectId && p.lifecycle_stage === stage) isActive = true;
              })));

              return (
                <button
                  key={stage}
                  onClick={() => handleStageChange(stage)}
                  disabled={!activeProjectId}
                  className={`py-3 px-2 rounded-xl text-center text-[10px] font-mono font-bold border transition-all ${
                    isActive
                      ? 'bg-[#0B3027] text-[#F8F6F1] border-[#0B3027] shadow-[0_4px_16px_rgba(11,48,39,0.3)]'
                      : 'bg-[#F8F6F1] text-[#0B3027]/60 border-[#0B3027]/10 hover:border-[#C9A56A]/50 hover:bg-white cursor-pointer'
                  }`}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#0B3027]/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#0B3027]/60" />
                  <h3 className="text-sm font-bold text-[#0B3027]">Credentials Vault</h3>
                </div>
              </div>

              {Object.keys(groupedCredentials).length === 0 ? (
                <div className="py-8 text-center text-xs text-[#0B3027]/50 font-mono">
                  No credentials stored for this project yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedCredentials).map(([category, creds]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-[#0B3027]/40 uppercase tracking-wider">{category}</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {creds.map(cred => (
                          <div key={cred.id} className="flex items-center justify-between p-3 rounded-lg border border-[#0B3027]/10 bg-[#F8F6F1]/50 hover:bg-white transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#0B3027]/5">
                                <KeyRound className="w-3.5 h-3.5 text-[#C9A56A]" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#0B3027]">{cred.name}</div>
                                {cred.username && <div className="text-[10px] text-[#0B3027]/60 font-mono">{cred.username}</div>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {revealedSecrets[cred.id] ? (
                                <div className="flex items-center gap-2">
                                  <code className="text-xs font-mono bg-[#0B3027]/5 px-2 py-1 rounded text-[#0B3027]">
                                    {revealedSecrets[cred.id]}
                                  </code>
                                  <button onClick={() => handleCopyCredential(cred.id, revealedSecrets[cred.id])} className="p-1.5 hover:bg-[#0B3027]/10 rounded text-[#0B3027]/60 transition-colors">
                                    {copiedCredId === cred.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              ) : null}
                              <button onClick={() => handleRevealCredential(cred.id)} className="p-1.5 hover:bg-[#0B3027]/10 rounded text-[#0B3027]/60 transition-colors" title={revealedSecrets[cred.id] ? "Hide Secret" : "Reveal Secret"}>
                                {revealedSecrets[cred.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Project Tasks */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#0B3027]/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[#0B3027]">Project Tasks</h3>
                <button onClick={() => setIsTaskPanelOpen(true)} className="text-xs font-bold text-[#C9A56A] hover:text-[#9A7B4F]">
                  + New Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#0B3027]/50 font-mono">
                  No active tasks.
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 rounded-xl border border-[#0B3027]/10 hover:border-[#C9A56A]/50 transition-colors bg-[#F8F6F1]/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold text-[#0B3027]">{task.title}</div>
                          <div className="text-xs text-[#0B3027]/60 mt-1">Assignee ID: {task.assignee_id || 'Unassigned'}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.status === 'DONE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {/* Environments */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#0B3027]/5">
              <h3 className="text-sm font-bold text-[#0B3027] mb-6">Environments</h3>
              <div className="space-y-4">
                {environments.length === 0 ? (
                  <div className="py-4 text-center text-xs text-[#0B3027]/50 font-mono">
                    No environments provisioned.
                  </div>
                ) : environments.map(env => (
                  <div key={env.id} className="p-4 rounded-xl border border-[#0B3027]/10 bg-[#F8F6F1]/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-sm text-[#0B3027]">{env.type}</div>
                      <span className="text-[10px] font-mono bg-[#0B3027]/5 px-2 py-0.5 rounded text-[#0B3027]/70">{env.status}</span>
                    </div>
                    {env.url ? (
                      <a href={env.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#C9A56A] hover:text-[#0B3027] transition-colors mt-2">
                        {env.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <div className="text-xs text-[#0B3027]/40 italic mt-2">Pending deployment</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Events */}
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#0B3027]/5">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-4 h-4 text-[#0B3027]/60" />
                <h3 className="text-sm font-bold text-[#0B3027]">Timeline</h3>
              </div>
              <div className="space-y-4">
                {activities.map(activity => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#C9A56A]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0B3027]">{activity.event_type.replace(/_/g, ' ')}</div>
                      {activity.payload && activity.payload.description && <div className="text-[10px] text-[#0B3027]/60 mt-0.5">{activity.payload.description}</div>}
                      <div className="text-[9px] font-mono text-[#0B3027]/40 mt-1">{new Date(activity.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {activeProjectId && (
        <CreateTaskPanel
          isOpen={isTaskPanelOpen}
          projectId={activeProjectId}
          onClose={() => setIsTaskPanelOpen(false)}
        />
      )}

      <ProvisionClientWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => fetchOrganizations()}
      />
    </div>
  );
};
