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

export interface EncryptedSecretItem {
  id: UUID;
  serviceName: string;
  usernameOrEmail: string;
  maskedPayload: string;
  requiredRole: StudioRoleName;
}

export interface CrmLeadItem {
  id: UUID;
  businessName: string;
  industry: string;
  telemetryScore: number;
  pipelineStage: 'LEAD' | 'CONTACTED' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'WON' | 'LOST';
  budgetRange: string;
  timelineRange: string;
  contactName: string;
  contactEmail: string;
  amountFormatted: string;
  currencyCode: 'USD' | 'INR' | 'EUR' | 'AED';
}

export interface StudioEventItem {
  id: UUID;
  eventKey: string;
  title: string;
  description: string;
  timestampLabel: string;
  tag: string;
}
