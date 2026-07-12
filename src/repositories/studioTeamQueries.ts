import { supabase } from '../lib/supabase';
import type { AuthRoleName } from '../auth/types';

export interface StudioMemberProjection {
  id: string;
  full_name: string | null;
  email: string;
  roles: AuthRoleName[];
  is_suspended: boolean;
  last_login: string | null;
  joined_at: string;
}

export interface StudioInvitationProjection {
  id: string;
  email: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expires_at: string;
  created_at: string;
  role: AuthRoleName;
}

export interface PaginatedResult<T> {
  projection_version: number;
  last_projected_at: string;
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface StudioTeamQueryFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: AuthRoleName;
  status?: string;
}

export const studioTeamKeys = {
  all: ['studio-team'] as const,
  members: (filters?: StudioTeamQueryFilters) => [...studioTeamKeys.all, 'members', filters] as const,
  invitations: (filters?: StudioTeamQueryFilters) => [...studioTeamKeys.all, 'invitations', filters] as const,
};

export const studioTeamQueries = {
  async getMembers(filters: StudioTeamQueryFilters = {}): Promise<PaginatedResult<StudioMemberProjection>> {
    const { data, error } = await supabase.rpc('rpc_studio_team_members_projection', {
      p_page: filters.page || 1,
      p_page_size: filters.pageSize || 10,
      p_search: filters.search || null,
      p_role: filters.role || null,
      p_status: filters.status || null
    });

    if (error) throw error;
    return data as unknown as PaginatedResult<StudioMemberProjection>;
  },

  async listInvitations(filters: StudioTeamQueryFilters = {}): Promise<PaginatedResult<StudioInvitationProjection>> {
    const { data, error } = await supabase.rpc('rpc_studio_team_invitations_projection', {
      p_page: filters.page || 1,
      p_page_size: filters.pageSize || 10,
      p_search: filters.search || null,
      p_status: filters.status || null
    });

    if (error) throw error;
    return data as unknown as PaginatedResult<StudioInvitationProjection>;
  }
};
