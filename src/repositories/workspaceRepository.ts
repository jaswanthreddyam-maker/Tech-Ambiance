import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  WorkspaceItem, 
  ProjectTask, 
  ProjectEnvironment,
  ProjectActivityEvent,
  ProjectCredential,
  OrganizationHierarchy,
  ProjectTemplate,
  ProvisionClientPayload
} from '../types/studioHQ';

export const workspaceRepository = {
  /**
   * Fetch all aggregated workspaces for the directory UI using the RPC.
   */
  async getWorkspaces(): Promise<WorkspaceItem[]> {
    if (!isSupabaseConfigured) return [];
    
    const { data, error } = await supabase.rpc('get_admin_workspaces');
    
    if (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
    
    return (data || []) as WorkspaceItem[];
  },

  /**
   * Convert a Won lead into a Workspace.
   */
  async convertLeadToWorkspace(leadId: string, adminUserId: string): Promise<{ success: boolean; workspace_id: string; project_id: string }> {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured.");
    }
    
    const { data, error } = await supabase.rpc('convert_lead_to_workspace', {
      p_lead_id: leadId,
      p_admin_user_id: adminUserId
    });
    
    if (error) {
      console.error('Error converting lead:', error);
      throw error;
    }
    
    return data;
  },

  /**
   * Get active project for a workspace (assuming 1:1 right now for simplicity)
   */
  async getActiveProject(workspaceId: string) {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project:', error);
      return null;
    }

    return data;
  },

  /**
   * Get environments for a project
   */
  async getProjectEnvironments(projectId: string): Promise<ProjectEnvironment[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('project_environments')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error fetching environments:', error);
      return [];
    }

    return data as ProjectEnvironment[];
  },

  /**
   * Get engineering tasks for a project
   */
  async getProjectTasks(projectId: string): Promise<ProjectTask[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data as ProjectTask[];
  },

  /**
   * Create a new engineering task
   */
  async createProjectTask(taskData: {
    project_id: string;
    title: string;
    description?: string;
    priority: string;
    milestone_id?: string;
    assignee_id?: string;
    actor_id: string;
  }) {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase.rpc('create_project_task', {
      p_project_id: taskData.project_id,
      p_title: taskData.title,
      p_description: taskData.description || null,
      p_priority: taskData.priority,
      p_milestone_id: taskData.milestone_id || null,
      p_assignee_id: taskData.assignee_id || null,
      p_actor_id: taskData.actor_id
    });

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return data;
  },

  /**
   * Watch for realtime changes on workspaces (Global)
   */
  watchWorkspaces(callback: () => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('workspaces_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspaces' }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Watch specifically for a single Project's mutations (Focused Realtime)
   */
  watchProject(projectId: string, callback: () => void) {
    if (!isSupabaseConfigured || !projectId) return () => {};

    const channel = supabase
      .channel(`project_${projectId}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_environments', filter: `project_id=eq.${projectId}` }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_tasks', filter: `project_id=eq.${projectId}` }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_activity_projection', filter: `project_id=eq.${projectId}` }, callback)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_credentials', filter: `project_id=eq.${projectId}` }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Get activity timeline for a project
   */
  async getProjectActivity(projectId: string): Promise<ProjectActivityEvent[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('project_activity_projection')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project activity:', error);
      return [];
    }

    return data as ProjectActivityEvent[];
  },

  /**
   * Get credentials for a project (Metadata only, no secrets)
   */
  async getProjectCredentials(projectId: string): Promise<ProjectCredential[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('project_credentials')
      .select('*')
      .eq('project_id', projectId)
      .is('archived_at', null)
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching credentials:', error);
      return [];
    }

    return data as ProjectCredential[];
  },

  /**
   * Reveal credential secret (requires REVEAL_SECRET permission)
   */
  async revealCredentialSecret(credentialId: string, actorId: string): Promise<{ secret_value: string, reveal_token_expires_in: number } | null> {
    if (!isSupabaseConfigured) return null;

    const { data, error } = await supabase.rpc('reveal_project_credential', {
      p_credential_id: credentialId,
      p_actor_id: actorId
    });

    if (error) {
      console.error('Error revealing credential:', error);
      throw error;
    }

    return data as { secret_value: string, reveal_token_expires_in: number };
  },

  /**
   * Record that a credential was copied to the clipboard
   */
  async recordCredentialCopied(credentialId: string, actorId: string) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.rpc('record_credential_copied', {
      p_credential_id: credentialId,
      p_actor_id: actorId
    });

    if (error) {
      console.error('Error recording credential copy:', error);
    }
  },

  async getOrganizationHierarchy(): Promise<OrganizationHierarchy[]> {
    if (!isSupabaseConfigured) return [];
    
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        workspaces (
          id,
          name,
          primary_contact_name,
          projects (
            id,
            name,
            lifecycle_stage,
            status
          )
        )
      `)
      .order('name');
      
    if (error) {
      console.error('Error fetching org hierarchy:', error);
      throw error;
    }
    
    return data.map((org: any) => ({
      id: org.id,
      name: org.name,
      primary_contact_name: org.workspaces?.[0]?.primary_contact_name,
      workspaces: org.workspaces || []
    })) as OrganizationHierarchy[];
  },
  
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('project_templates')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as ProjectTemplate[];
  },

  async provisionClient(payload: ProvisionClientPayload, adminUserId: string, idempotencyKey: string): Promise<any> {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured");
    
    const { data, error } = await supabase.rpc('provision_client_command', {
      payload,
      p_admin_user_id: adminUserId,
      p_idempotency_key: idempotencyKey
    });
    
    if (error) {
      console.error('Provision client error:', error);
      throw error;
    }
    
    return data;
  },

  /**
   * Create a new project under a workspace.
   * This is a dedicated Project creation method — distinct from createProjectTask().
   */
  async createProject(projectData: {
    workspace_id: string;
    name: string;
    lifecycle_stage?: string;
    actor_id: string;
  }) {
    if (!isSupabaseConfigured) return null;

    const generatedSlug = (
      projectData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7)
    );

    const { data, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: projectData.workspace_id,
        name: projectData.name,
        slug: generatedSlug,
        lifecycle_stage: projectData.lifecycle_stage || 'DISCOVERY',
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  }
};
