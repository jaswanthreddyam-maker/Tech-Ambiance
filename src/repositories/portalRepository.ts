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

export const portalRepository = {
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
   * Get project environments (Filters out INTERNAL)
   */
  async getEnvironments(projectId: string): Promise<ProjectEnvironment[]> {
    if (!isSupabaseConfigured || !projectId) return [];

    const { data, error } = await supabase
      .from('project_environments')
      .select('*')
      .eq('project_id', projectId)
      .neq('visibility', 'INTERNAL')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching environments:', error);
      return [];
    }

    return data as ProjectEnvironment[];
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
      console.error('Error fetching credentials:', error);
      return [];
    }

    return data as ProjectCredential[];
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
   * Watch for realtime changes on the project and invalidate React Query cache
   */
  watchPortal(projectId: string, queryClient: QueryClient) {
    if (!isSupabaseConfigured || !projectId) return () => {};

    const channel = supabase
      .channel(`portal_${projectId}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['clientProjects'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
        queryClient.invalidateQueries({ queryKey: ['clientProjects'] }); // because progress depends on milestones
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_environments', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['environments', projectId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_credentials', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['credentials', projectId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_activity_projection', filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['timeline', projectId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
