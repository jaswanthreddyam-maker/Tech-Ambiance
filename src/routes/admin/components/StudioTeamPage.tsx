import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Clock, Key, Loader2, RefreshCw, XCircle } from 'lucide-react';
import type { AuthRoleName } from '../../../auth/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studioTeamQueries, studioTeamKeys, type StudioTeamQueryFilters } from '../../../repositories/studioTeamQueries';
import { studioTeamCommands } from '../../../repositories/studioTeamCommands';
import { supabase } from '../../../lib/supabase';

export const StudioTeamPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'permissions'>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AuthRoleName>("OWNER");
  const [inviteError, setInviteError] = useState("");
  const [newInviteLink, setNewInviteLink] = useState("");

  const [filters] = useState<StudioTeamQueryFilters>({ page: 1, pageSize: 10 });

  // 1. Queries
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: studioTeamKeys.members(filters),
    queryFn: () => studioTeamQueries.getMembers(filters),
    enabled: activeTab === 'members'
  });

  const { data: invitationsData, isLoading: isLoadingInvitations } = useQuery({
    queryKey: studioTeamKeys.invitations(filters),
    queryFn: () => studioTeamQueries.listInvitations(filters),
    enabled: activeTab === 'invitations'
  });

  // 2. Mutations
  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string, role: AuthRoleName }) => studioTeamCommands.inviteMember(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studioTeamKeys.all });
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteError("");
      // Construct the invite link and display it to the user
      // The user just needs to log in at the admin portal, the database trigger will auto-link their invitation!
      const link = `${window.location.origin}/auth/admin`;
      setNewInviteLink(link);
    },
    onError: (err: any) => {
      setInviteError(err.message || "Failed to send invitation.");
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => studioTeamCommands.revokeInvitation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studioTeamKeys.all })
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => studioTeamCommands.resendInvitation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studioTeamKeys.all })
  });

  // 3. Realtime Subscription (Stopgap for UI invalidation)
  useEffect(() => {
    const profilesSub = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: studioTeamKeys.all });
      }).subscribe();

    const rolesSub = supabase.channel('user-roles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        queryClient.invalidateQueries({ queryKey: studioTeamKeys.all });
      }).subscribe();

    const invitesSub = supabase.channel('invitations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, () => {
        queryClient.invalidateQueries({ queryKey: studioTeamKeys.all });
      }).subscribe();

    return () => {
      supabase.removeChannel(profilesSub);
      supabase.removeChannel(rolesSub);
      supabase.removeChannel(invitesSub);
    };
  }, [queryClient]);


  const handleSendInvitation = async () => {
    if (!inviteEmail) return;
    setInviteError("");
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const roles = [
    { name: 'OWNER', permissions: 'ALL_PERMISSIONS (Full multi-tenant control)' },
    { name: 'ADMIN', permissions: 'workspaces:*, crm:*, cms:*, ai:*, media:*' },
    { name: 'PROJECT_MANAGER', permissions: 'workspaces:write, tasks:*, crm:read' },
    { name: 'DEVELOPER', permissions: 'projects:*, tasks:*, vault:read' },
    { name: 'DESIGNER', permissions: 'projects:read, cms:write, media:*' },
    { name: 'STRATEGIST', permissions: 'crm:*, ai:*, proposals:*' },
    { name: 'SALES', permissions: 'crm:*, proposals:*' },
    { name: 'CLIENT', permissions: 'portal:read, proposals:view' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0B3027]/10">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-bold text-[#0B3027]">
            Studio Team
          </h1>
          <p className="text-sm text-[#0B3027]/70 mt-1">
            Manage your organization members, pending invitations, and granular RBAC matrices.
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#0B3027] text-white rounded-xl hover:bg-[#13493C] transition-all shadow-md active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span className="font-semibold text-sm">Invite Member</span>
        </button>
      </div>

      <div className="flex space-x-6 border-b border-[#0B3027]/10">
        {(['members', 'invitations', 'permissions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize transition-all ${
              activeTab === tab 
                ? 'text-[#C9A56A] border-b-2 border-[#C9A56A]' 
                : 'text-[#0B3027]/60 hover:text-[#0B3027]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {newInviteLink && (
        <div className="bg-[#0B3027] text-white p-4 rounded-xl border border-[#C9A56A]/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <h3 className="font-semibold">Invitation Created!</h3>
            <p className="text-sm text-white/80">Since you're on the Resend free tier, emails only send to verified domains. Copy this link and send it directly:</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="text" 
              readOnly 
              value={newInviteLink} 
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(newInviteLink);
                setNewInviteLink("");
              }}
              className="px-4 py-1.5 bg-[#C9A56A] text-[#0B3027] text-sm font-semibold rounded-lg hover:bg-[#D4B37F] transition-colors whitespace-nowrap"
            >
              Copy & Close
            </button>
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'permissions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {roles.map((role) => (
              <div
                key={role.name}
                className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-[#C9A56A]/25 space-y-2.5 shadow-[0_8px_30px_rgba(11,48,39,0.06)] hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#0B3027]">
                    {role.name}
                  </span>
                  <ShieldCheck className="w-5 h-5 text-[#C9A56A]" />
                </div>
                <div className="text-xs font-mono font-semibold text-[#0B3027]/75 bg-[#F8F6F1] p-3 rounded-xl border border-[#0B3027]/10">
                  {role.permissions}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-[#0B3027]/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {isLoadingMembers ? (
              <div className="p-12 text-center text-[#0B3027]/60 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#C9A56A]" />
                <p className="font-semibold text-sm">Loading Members...</p>
              </div>
            ) : membersData?.items?.length ? (
              <div className="divide-y divide-[#0B3027]/5">
                {membersData.items.map(member => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors">
                    <div>
                      <p className="font-bold text-[#0B3027]">{member.full_name || 'No Name'}</p>
                      <p className="text-xs text-[#0B3027]/60">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {member.roles?.map(role => (
                        <span key={role} className="text-[10px] font-bold tracking-wider px-2 py-1 bg-[#0B3027]/5 text-[#0B3027]/80 rounded-md">
                          {role}
                        </span>
                      ))}
                      {member.is_suspended && (
                        <span className="text-[10px] font-bold tracking-wider px-2 py-1 bg-red-100 text-red-700 rounded-md">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[#0B3027]/60">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-lg">No Members Found</p>
                <p className="text-sm">This organization has no members.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-[#0B3027]/10 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {isLoadingInvitations ? (
              <div className="p-12 text-center text-[#0B3027]/60 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#C9A56A]" />
                <p className="font-semibold text-sm">Loading Invitations...</p>
              </div>
            ) : invitationsData?.items?.length ? (
              <div className="divide-y divide-[#0B3027]/5">
                {invitationsData.items.map(invite => (
                  <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-white/60 transition-colors">
                    <div>
                      <p className="font-bold text-[#0B3027]">{invite.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md ${
                          invite.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          invite.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                          invite.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invite.status}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-[#0B3027]/5 text-[#0B3027]/80 rounded-md">
                          {invite.role}
                        </span>
                      </div>
                    </div>
                    
                    {['PENDING', 'SENT'].includes(invite.status) && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => resendMutation.mutate(invite.id)}
                          disabled={resendMutation.isPending}
                          className="p-2 text-[#0B3027]/50 hover:text-[#C9A56A] hover:bg-[#C9A56A]/10 rounded-lg transition-all"
                          title="Resend Invitation"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if (confirm('Are you sure you want to revoke this invitation?')) revokeMutation.mutate(invite.id); }}
                          disabled={revokeMutation.isPending}
                          className="p-2 text-[#0B3027]/50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Revoke Invitation"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[#0B3027]/60">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-semibold text-lg">No Invitations</p>
                <p className="text-sm">Click 'Invite Member' to create a new invitation.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B3027]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#0B3027]/10 flex items-center justify-between">
              <h2 className="font-['Cormorant_Garamond'] font-bold text-2xl text-[#0B3027]">Invite Studio Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-[#0B3027]/50 hover:text-[#0B3027]">
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4">
              {inviteError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                  {inviteError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-[#0B3027]/70 uppercase tracking-wider mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@techambiance.com" 
                  className="w-full p-3 rounded-xl border border-[#0B3027]/20 focus:border-[#C9A56A] focus:ring-1 focus:ring-[#C9A56A] transition-all bg-[#F8F6F1] font-semibold text-[#0B3027]" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0B3027]/70 uppercase tracking-wider mb-2">Assign Role</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AuthRoleName)}
                  className="w-full p-3 rounded-xl border border-[#0B3027]/20 focus:border-[#C9A56A] focus:ring-1 focus:ring-[#C9A56A] transition-all bg-[#F8F6F1] font-semibold text-[#0B3027]"
                >
                  {roles.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleSendInvitation}
                disabled={inviteMutation.isPending || !inviteEmail}
                className="w-full py-3 mt-4 bg-[#C9A56A] text-[#0B3027] rounded-xl font-bold hover:bg-[#D4B37D] transition-all shadow-md disabled:opacity-50"
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
