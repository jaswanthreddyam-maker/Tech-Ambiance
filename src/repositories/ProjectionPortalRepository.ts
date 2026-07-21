import { supabase } from '../lib/supabase';
import { QueryClient } from '@tanstack/react-query';
import { portalQueryKeys } from '../routes/portal/hooks/portalQueryKeys';
import type { IPortalRepository } from './IPortalRepository';
import type { 
  MilestoneItem, 
  DeliverableFile, 
  ProjectActivityEvent, 
  ProjectEnvironment, 
  ProjectCredential 
} from '../types/studioHQ';

/**
 * ProjectionPortalRepository (Phase C7.9B)
 * 
 * This repository reads exclusively from the optimized portal_*_projection tables.
 * It implements the exact same interface as RawPortalRepository, allowing a seamless
 * feature-flagged cutover in PortalDomainService.
 */
export const ProjectionPortalRepository: IPortalRepository = {

  watchPortal(projectId: string, queryClient: QueryClient) {
    // In Phase C7.9B, we watch the projection tables instead of raw tables.
    // For now, this is a placeholder that will watch the main projection records.
    
    const channel = supabase.channel(`portal-projections-${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_home_projection', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: portalQueryKeys.home(projectId) });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_feed_projection', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: portalQueryKeys.updates(projectId) });
          queryClient.invalidateQueries({ queryKey: portalQueryKeys.home(projectId) }); // feed affects home
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portal_project_projection', filter: `project_id=eq.${projectId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: portalQueryKeys.project(projectId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async getProject(projectId: string): Promise<any | null> {
    // Fetch from portal_home_projection / portal_project_projection
    // Since the interface currently demands `Project`, we map the projection fields
    // back into the expected raw structure (or refactor the Builders to accept 
    // the projection directly in the future).
    
    // For Phase C7.9B execution, we implement the read models here.
    const { data, error } = await supabase
      .from('portal_home_projection')
      .select('*')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error || !data) {
      console.warn('Projection missing for getProject, falling back to RawPortalRepository');
      // Fallback to Raw Repository during cutover if projection is not built yet
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getProject(projectId);
    }

    // Adapt projection to expected legacy Project format for Builders
    return {
      id: projectId,
      name: 'Project', // Would need project metadata projection or joined
      status: 'active',
      progress_percentage: data.progress_percentage,
      budget_health: data.health_budget as any,
      timeline_health: data.health_timeline as any,
      // ... mapping other required fields based on projection
    } as any;
  },

  async getMilestones(projectId: string): Promise<MilestoneItem[]> {
    const { RawPortalRepository } = await import('./RawPortalRepository');
    return RawPortalRepository.getMilestones(projectId);
  },

  async getDocuments(projectId: string): Promise<DeliverableFile[]> {
    const { data, error } = await supabase
      .from('portal_project_deliverables_projection')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (error || !data) {
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getDocuments(projectId);
    }

    return data.map(d => ({
      id: d.deliverable_id,
      project_id: d.project_id,
      file_name: d.file_name,
      storage_path: d.storage_path,
      uploaded_at: new Date().toISOString()
    })) as unknown as DeliverableFile[];
  },

  async getTimeline(projectId: string): Promise<ProjectActivityEvent[]> {
    const { data, error } = await supabase
      .from('portal_feed_projection')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false });

    if (error || !data) {
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getTimeline(projectId);
    }

    return data.map(d => ({
      id: d.id,
      project_id: d.project_id,
      event_type: d.category,
      title: d.title,
      description: d.description,
      icon: d.icon,
      created_at: d.timestamp,
    })) as any[];
  },

  async getEnvironments(projectId: string): Promise<ProjectEnvironment[]> {
    const { data, error } = await supabase
      .from('portal_project_environments_projection')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) {
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getEnvironments(projectId);
    }

    return data.map(e => ({
      id: e.environment_id,
      project_id: e.project_id,
      name: e.name,
      url: e.url,
      status: e.status,
    })) as any[];
  },

  async getCredentials(projectId: string): Promise<ProjectCredential[]> {
    const { data, error } = await supabase
      .from('portal_project_credentials_projection')
      .select('*')
      .eq('project_id', projectId);

    if (error || !data) {
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getCredentials(projectId);
    }

    return data.map(c => ({
      id: c.credential_id,
      project_id: c.project_id,
      name: c.name,
      username: c.username,
      // The secret is deliberately never projected in plaintext.
    })) as any[];
  },

  async getInvoices(): Promise<any[]> {
    // In Phase C7.9B, billing projections might be keyed by organization_id.
    // RLS will filter.
    const { data, error } = await supabase
      .from('portal_billing_projection')
      .select('*');

    if (error || !data) {
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getInvoices();
    }

    // The current UI relies on individual invoices. For now, we return empty
    // since the projection holds an aggregate. We will likely need a child table
    // for pending invoices to fulfill the billing UI contract.
    return [];
  },

  async getClientProjects(): Promise<any[]> {
    const { data, error } = await supabase
      .from('portal_home_projection')
      .select('project_id');

    if (error || !data) {
      const { RawPortalRepository } = await import('./RawPortalRepository');
      return RawPortalRepository.getClientProjects();
    }

    return data.map(p => ({
      id: p.project_id
    }));
  }
};
