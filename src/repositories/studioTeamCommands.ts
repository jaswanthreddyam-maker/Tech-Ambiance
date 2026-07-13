import { supabase } from '../lib/supabase';
import type { AuthRoleName } from '../auth/types';

export const studioTeamCommands = {
  async inviteMember(email: string, roleName: AuthRoleName) {
    // We derive orgId implicitly or we must get it from auth.uid() inside the RPC
    // Wait, create_studio_invitation in the database currently requires p_org_id as an argument.
    // Let's get the active organization for the current user and pass it.
    // In a fully strict CQRS, the RPC would derive it, but currently create_studio_invitation takes p_org_id.
    
    // First, let's get the active org for the user:
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const { data: profile } = await supabase.from('profiles').select('active_organization_id').eq('id', user.id).single();
    
    let orgId = profile?.active_organization_id;
    if (!orgId) {
      const { data: fallbackOrg } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (!fallbackOrg) throw new Error("No active organization found and no fallback organizations exist.");
      orgId = fallbackOrg.id;
      // Auto-heal the profile
      await supabase.from('profiles').update({ active_organization_id: orgId }).eq('id', user.id);
    }

    const { data, error } = await supabase.rpc('create_studio_invitation', {
      p_email: email,
      p_role_name: roleName,
      p_org_id: orgId
    });
    
    if (error) throw error;
    return data;
  },

  async revokeInvitation(invitationId: string) {
    const { error } = await supabase.rpc('revoke_studio_invitation', {
      p_invitation_id: invitationId
    });
    if (error) throw error;
  },

  async resendInvitation(invitationId: string) {
    const { error } = await supabase.rpc('resend_studio_invitation', {
      p_invitation_id: invitationId
    });
    if (error) throw error;
  },

  async assignRole(userId: string, roleName: AuthRoleName) {
    const { error } = await supabase.rpc('assign_role', {
      p_user_id: userId,
      p_role_name: roleName
    });
    if (error) throw error;
  },

  async removeRole(userId: string, roleName: AuthRoleName) {
    const { error } = await supabase.rpc('remove_role', {
      p_user_id: userId,
      p_role_name: roleName
    });
    if (error) throw error;
  },

  async suspendMember(userId: string, reason: string) {
    const { error } = await supabase.rpc('suspend_user_access', {
      p_user_id: userId,
      p_reason: reason
    });
    if (error) throw error;
  },

  async reactivateMember(userId: string) {
    const { error } = await supabase.rpc('reactivate_user_access', {
      p_user_id: userId
    });
    if (error) throw error;
  }
};
