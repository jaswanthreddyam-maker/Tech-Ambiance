// =============================================================================
// TECH AMBIANCE STUDIOHQ — ENTERPRISE PERMISSION SYSTEM
// =============================================================================
//
// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// 
// This file is generated from `authorization/permissions.yaml`.
// Run `node scripts/generate_permissions.js` to update.
//
// =============================================================================

export const Permission = {
  DASHBOARD_READ: 'dashboard:read',
  DASHBOARD_EXPORT: 'dashboard:export',
  PORTFOLIO_READ: 'portfolio:read',
  PORTFOLIO_WRITE: 'portfolio:write',
  PORTFOLIO_DELETE: 'portfolio:delete',
  PORTFOLIO_PUBLISH: 'portfolio:publish',
  PROJECT_READ: 'project:read',
  CRM_READ: 'crm:read',
  CRM_WRITE: 'crm:write',
  CRM_DELETE: 'crm:delete',
  CRM_EXPORT: 'crm:export',
  CRM_PROPOSAL: 'crm:proposal',
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_WRITE: 'workspace:write',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_PROVISION: 'workspace:provision',
  MEDIA_READ: 'media:read',
  MEDIA_UPLOAD: 'media:upload',
  MEDIA_DELETE: 'media:delete',
  AI_READ: 'ai:read',
  AI_SCOUT: 'ai:scout',
  AI_GENERATE: 'ai:generate',
  CMS_READ: 'cms:read',
  CMS_EDIT: 'cms:edit',
  CMS_PUBLISH: 'cms:publish',
  CMS_ROLLBACK: 'cms:rollback',
  SYSTEM_READ: 'system:read',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_ROLES: 'system:roles',
  SYSTEM_USERS: 'system:users',
  SYSTEM_BILLING: 'system:billing',
  ANALYTICS_FINANCE: 'analytics:finance',
} as const;

export type PermissionId = typeof Permission[keyof typeof Permission];

export interface PermissionMetadata {
  id: PermissionId;
  name: string;
  description: string;
  module: 'Dashboard' | 'Portfolio' | 'CRM' | 'Workspaces' | 'Media' | 'AI' | 'CMS' | 'System' | 'Analytics';
  dangerous?: boolean;
}

export const PERMISSION_METADATA: Record<PermissionId, PermissionMetadata> = {
  'dashboard:read': { id: 'dashboard:read', name: 'View Dashboard', description: 'Can view the overview dashboard', module: 'Dashboard' },
  'dashboard:export': { id: 'dashboard:export', name: 'Export Dashboard', description: 'Can export executive reports and metrics', module: 'Dashboard' },
  'portfolio:read': { id: 'portfolio:read', name: 'View Portfolio', description: 'Can view portfolio projects', module: 'Portfolio' },
  'portfolio:write': { id: 'portfolio:write', name: 'Edit Portfolio', description: 'Can create and edit portfolio projects', module: 'Portfolio' },
  'portfolio:delete': { id: 'portfolio:delete', name: 'Delete Portfolio', description: 'Can permanently delete portfolio projects', module: 'Portfolio', dangerous: true },
  'portfolio:publish': { id: 'portfolio:publish', name: 'Publish Portfolio', description: 'Can change project status to published', module: 'Portfolio' },
  'project:read': { id: 'project:read', name: 'View Projects', description: 'Can view internal operational projects', module: 'Portfolio' },
  'crm:read': { id: 'crm:read', name: 'View CRM', description: 'Can view leads and pipelines', module: 'CRM' },
  'crm:write': { id: 'crm:write', name: 'Edit CRM', description: 'Can update lead status and details', module: 'CRM' },
  'crm:delete': { id: 'crm:delete', name: 'Delete Lead', description: 'Can delete leads from pipeline', module: 'CRM', dangerous: true },
  'crm:export': { id: 'crm:export', name: 'Export CRM', description: 'Can export pipeline data to CSV', module: 'CRM' },
  'crm:proposal': { id: 'crm:proposal', name: 'Generate Proposals', description: 'Can generate interactive SOWs', module: 'CRM' },
  'workspace:read': { id: 'workspace:read', name: 'View Workspaces', description: 'Can view client workspaces', module: 'Workspaces' },
  'workspace:write': { id: 'workspace:write', name: 'Edit Workspaces', description: 'Can edit workspace details and projects', module: 'Workspaces' },
  'workspace:delete': { id: 'workspace:delete', name: 'Delete Workspaces', description: 'Can delete workspaces', module: 'Workspaces', dangerous: true },
  'workspace:provision': { id: 'workspace:provision', name: 'Provision Workspace', description: 'Can provision new client environments', module: 'Workspaces' },
  'media:read': { id: 'media:read', name: 'View Media', description: 'Can browse the media vault', module: 'Media' },
  'media:upload': { id: 'media:upload', name: 'Upload Media', description: 'Can upload assets to edge storage', module: 'Media' },
  'media:delete': { id: 'media:delete', name: 'Delete Media', description: 'Can delete assets from edge storage', module: 'Media', dangerous: true },
  'ai:read': { id: 'ai:read', name: 'View AI Center', description: 'Can view the AI Center dashboard', module: 'AI' },
  'ai:scout': { id: 'ai:scout', name: 'Run ScoutAI', description: 'Can execute autonomous diagnostic scans', module: 'AI' },
  'ai:generate': { id: 'ai:generate', name: 'Generate SOW (AI)', description: 'Can use AI to generate Executive Summaries', module: 'AI' },
  'cms:read': { id: 'cms:read', name: 'View CMS', description: 'Can view website drafts and diffs', module: 'CMS' },
  'cms:edit': { id: 'cms:edit', name: 'Edit CMS', description: 'Can edit website copy and sections', module: 'CMS' },
  'cms:publish': { id: 'cms:publish', name: 'Publish CMS', description: 'Can trigger cache invalidation and publish to edge', module: 'CMS', dangerous: true },
  'cms:rollback': { id: 'cms:rollback', name: 'Rollback CMS', description: 'Can rollback website to previous snapshot', module: 'CMS', dangerous: true },
  'system:read': { id: 'system:read', name: 'View System Settings', description: 'Can view system and workspace settings', module: 'System' },
  'system:audit': { id: 'system:audit', name: 'View Audit Logs', description: 'Can view security audit logs', module: 'System' },
  'system:roles': { id: 'system:roles', name: 'Manage Roles', description: 'Can modify role definitions and assignments', module: 'System', dangerous: true },
  'system:users': { id: 'system:users', name: 'Manage Users', description: 'Can invite, revoke, or delete studio users', module: 'System', dangerous: true },
  'system:billing': { id: 'system:billing', name: 'Manage Billing', description: 'Can view and modify billing information', module: 'System', dangerous: true },
  'analytics:finance': { id: 'analytics:finance', name: 'View Financial Analytics', description: 'Can view revenue and financial metrics', module: 'Analytics' },
};

// =========================================================================
// End of auto-generated file
// =========================================================================

export const AUTHORIZATION_FRAMEWORK_VERSION = '1.0';

