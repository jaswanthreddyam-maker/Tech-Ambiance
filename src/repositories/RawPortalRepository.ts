import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';
import type { 
  ProjectEnvironment, 
  ProjectCredential, 
  ProjectActivityEvent,
  MilestoneItem,
  DeliverableFile
} from '../types/studioHQ';
import type { QueryClient } from '@tanstack/react-query';
import type { IPortalRepository } from './IPortalRepository';

export const RawPortalRepository: IPortalRepository = {
  /**
   * Get all projects for the currently authenticated client
   */
  async getClientProjects() {
    if (!isSupabaseConfigured) return [];
    
    // RLS implicitly filters this to projects in workspaces the client is a member of
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        workspaces (
          name,
          organizations (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client projects:', error);
      return [];
    }

    return data;
  },

  /**
   * Get a single project
   */
  async getProject(projectId: string) {
    const projects = await this.getClientProjects();
    return projects.find((p: any) => p.id === projectId) || null;
  },

  /**
   * Get project milestones
   */
  async getMilestones(projectId: string): Promise<MilestoneItem[]> {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }

    return data as MilestoneItem[];
  },

  /**
   * Get deliverable documents
   */
  async getDocuments(projectId: string): Promise<DeliverableFile[]> {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('deliverable_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data as DeliverableFile[];
  },

  /**
   * Get project environments (Filters out INTERNAL with fallback for schema variations)
   */
  async getEnvironments(projectId: string): Promise<ProjectEnvironment[]> {
    if (!isSupabaseConfigured || !projectId) return [];

    let { data, error } = await supabase
      .from('project_environments')
      .select('*')
      .eq('project_id', projectId)
      .neq('visibility', 'INTERNAL')
      .order('created_at', { ascending: false });

    // Fallback if 'visibility' column is missing in schema
    if (error && (error.code === '42703' || error.message?.includes('visibility'))) {
      const fallback = await supabase
        .from('project_environments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      return [];
    }

    return (data || []) as ProjectEnvironment[];
  },

  /**
   * Get project credentials (Filters out AGENCY)
   */
  async getCredentials(projectId: string): Promise<ProjectCredential[]> {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('project_credentials')
      .select('*')
      .eq('project_id', projectId)
      .is('archived_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      // Table missing (PGRST205) or not yet provisioned
      return [];
    }

    return (data || []) as ProjectCredential[];
  },

  /**
   * Get timeline projection events
   */
  async getTimeline(projectId: string): Promise<ProjectActivityEvent[]> {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('project_activity_projection')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_client_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching timeline:', error);
      return [];
    }

    return data as ProjectActivityEvent[];
  },

  /**
   * Get invoices for the authenticated client.
   * No organizationId parameter — RLS filters by organization_members.user_id = auth.uid()
   */
  async getInvoices() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Watch for realtime changes on the project and invalidate React Query cache.
   * Each table change invalidates only its own portalQueryKeys entry (granular).
   */
  watchPortal(projectId: string, queryClient: QueryClient) {
    if (!isSupabaseConfigured || !projectId) return () => {};

    const channel = supabase
      .channel(`portal_${projectId}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'projects'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'milestones', projectId] });
        queryClient.invalidateQueries({ queryKey: ['portal', 'projects'] }); // progress depends on milestones
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliverable_files', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'documents', projectId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_environments', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'environments', projectId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_credentials', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'credentials', projectId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_activity_projection', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'timeline', projectId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
        queryClient.invalidateQueries({ queryKey: ['portal', 'billing'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

