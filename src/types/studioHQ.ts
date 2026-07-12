export type UUID = string;
export type ISO8601Date = string;

export type StudioRoleName =
  | 'Owner'
  | 'Admin'
  | 'Project Manager'
  | 'Developer'
  | 'Designer'
  | 'Strategist'
  | 'Sales'
  | 'Client';

export type WorkspaceStatus = 'ACTIVE' | 'ONBOARDING' | 'COMPLETED' | 'ARCHIVED';

export interface WorkspaceItem {
  id: UUID;
  workspaceName: string;
  slug: string;
  clientCompany: string;
  primaryContactName: string;
  primaryContactEmail: string;
  status: WorkspaceStatus;
  projectCount: number;
  activeStage: 'DISCOVERY' | 'DESIGN' | 'DEVELOPMENT' | 'TESTING' | 'DEPLOYMENT' | 'MAINTENANCE';
  createdAt: ISO8601Date;
}

export interface LinearTaskItem {
  id: UUID;
  workspaceId: UUID;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  assigneeName: string;
  dueDate: string;
}

export interface ProjectCredential {
  id: UUID;
  project_id: UUID;
  name: string;
  username: string | null;
  description: string | null;
  tags: string[] | null;
  environment: string | null;
  category: 'Infrastructure' | 'Development' | 'Analytics' | 'Payments' | 'Domains' | 'Email' | 'Storage' | 'Third-party APIs';
  provider: 'SUPABASE' | 'AWS' | 'DOPPLER' | 'VAULT' | 'LOCAL';
  secret_reference: string;
  visibility: 'AGENCY' | 'CLIENT' | 'SHARED';
  version: number;
  last_rotated_at: ISO8601Date;
  expires_at: ISO8601Date | null;
  last_viewed_at: ISO8601Date | null;
  last_viewed_by: UUID | null;
  archived_at: ISO8601Date | null;
  archived_by: UUID | null;
  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

export interface ProjectCredentialPermission {
  credential_id: UUID;
  role_id: UUID;
  permission_type: 'VIEW_METADATA' | 'REVEAL_SECRET' | 'MANAGE_CREDENTIAL';
  assigned_by: UUID | null;
  created_at: ISO8601Date;
}

export interface StudioEventItem {
  id: UUID;
  eventKey: string;
  title: string;
  description: string;
  timestampLabel: string;
  tag: string;
}

// Enterprise Agency OS Project Types

export interface ProjectEnvironment {
  id: UUID;
  project_id: UUID;
  type: string;
  url: string;
  status: string;
  visibility: 'PUBLIC' | 'CLIENT' | 'INTERNAL';
  last_deployed?: ISO8601Date | null;
  commit_sha?: string | null;
  version: number;
}

export interface ProjectTask {
  id: UUID;
  project_id: UUID;
  milestone_id: UUID | null;
  title: string;
  description: string | null;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  assignee_id: UUID | null;
  estimate: string | null;
  labels: string[] | null;
  due_date: string | null;
  github_issue: string | null;
  blocked_by_task_id: UUID | null;
  display_order: number;
  version: number;
}

export interface ProjectDeployment {
  id: UUID;
  project_id: UUID;
  environment_id: UUID;
  commit_sha: string;
  branch: string;
  status: 'Pending' | 'In Progress' | 'Healthy' | 'Failed';
  started_at: ISO8601Date;
  completed_at: ISO8601Date | null;
  actor_id: UUID | null;
  deployment_provider: string | null;
  deployment_url: string | null;
}

export interface ProjectActivityEvent {
  id: UUID;
  project_id: UUID;
  actor_id: UUID | null;
  event_type: string;
  payload: any;
  is_client_visible: boolean;
  created_at: ISO8601Date;
}

export interface MilestoneItem {
  id: UUID;
  project_id: UUID;
  title: string;
  description: string | null;
  target_date: ISO8601Date;
  status: 'pending' | 'active' | 'completed' | 'archived';
  display_order: number;
  completed_at: ISO8601Date | null;
  created_at: ISO8601Date;
}

export interface DeliverableFile {
  id: UUID;
  project_id: UUID;
  milestone_id: UUID | null;
  file_name: string;
  version_tag: string;
  category: string;
  file_size: string;
  file_type: string;
  storage_path: string;
  uploaded_by: UUID | null;
  created_at: ISO8601Date;
}

export interface ProjectTemplate {
  id: UUID;
  name: string;
  description: string;
  version: number;
  is_active: boolean;
}

export interface ProvisionClientPayload {
  organization: {
    name: string;
    business_category: string;
    gst_number?: string;
    website_url?: string;
    logo_url?: string;
  };
  contact: {
    full_name: string;
    email: string;
    phone?: string;
    position?: string;
  };
  workspace: {
    name: string;
    country: string;
    timezone: string;
    is_primary: boolean;
  };
  projects: {
    template_ids: string[];
  };
  activation: {
    method: 'INVOICE_PAID' | 'EXECUTIVE_OVERRIDE' | 'INTERNAL_PROJECT' | 'MIGRATION';
    portal_visibility: 'IMMEDIATELY' | 'AFTER_FIRST_PROJECT_SETUP';
    invite_now: boolean;
  };
}

export interface ProjectInHierarchy {
  id: UUID;
  name: string;
  lifecycle_stage: string;
  status: string;
  template_version: number | null;
}

export interface WorkspaceInHierarchy {
  id: UUID;
  name: string;
  projects: ProjectInHierarchy[];
}

export interface OrganizationHierarchy {
  id: UUID;
  name: string;
  business_category: string | null;
  workspaces: WorkspaceInHierarchy[];
  primary_contact_name?: string;
}
