import { Permission, type PermissionId } from '../registry/permissions';

export type ActionCategory = 
  | "navigation"
  | "mutation"
  | "destructive"
  | "generation"
  | "export";

export interface ActionDefinition {
  id: string;
  requiredPermission: PermissionId;
  category?: ActionCategory;
  
  dangerous?: boolean;
  requiresConfirmation?: boolean;
  confirmationStyle?: "default" | "warning" | "danger";
  
  confirmationTitle?: string;
  confirmationMessage?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  
  successMessage?: string | ((data?: any) => string);
  failureToast?: string;
  
  retryable?: boolean;
  analyticsEvent?: string;
  visibility?: "disabled" | "hidden";
}

export const ACTION_REGISTRY: Record<string, ActionDefinition> = {
  'dashboard.export': {
    id: 'dashboard.export',
    requiredPermission: Permission.DASHBOARD_EXPORT,
    category: 'export',
    analyticsEvent: 'dashboard_exported',
    visibility: 'disabled',
  },
  'dashboard.refresh': {
    id: 'dashboard.refresh',
    requiredPermission: Permission.DASHBOARD_READ,
    category: 'navigation',
    analyticsEvent: 'dashboard_refreshed',
  },
  'workspace.provision': {
    id: 'workspace.provision',
    requiredPermission: Permission.WORKSPACE_PROVISION,
    category: 'mutation',
    successMessage: 'Client workspace provisioned successfully.',
    analyticsEvent: 'workspace_provisioned',
    visibility: 'disabled',
  },
  'workspace.create': {
    id: 'workspace.create',
    requiredPermission: Permission.WORKSPACE_WRITE,
    category: 'mutation',
    successMessage: 'Workspace created successfully.',
    analyticsEvent: 'workspace_created',
  },
  'workspace.delete': {
    id: 'workspace.delete',
    requiredPermission: Permission.WORKSPACE_DELETE,
    category: 'destructive',
    dangerous: true,
    requiresConfirmation: true,
    confirmationStyle: 'danger',
    confirmationTitle: 'Delete Workspace',
    confirmationMessage: 'Are you sure you want to permanently delete this workspace and all associated data?',
    confirmButtonLabel: 'Delete Workspace',
    cancelButtonLabel: 'Cancel',
    successMessage: 'Workspace deleted successfully.',
    analyticsEvent: 'workspace_deleted',
    visibility: 'disabled',
  },
  'portfolio.publish': {
    id: 'portfolio.publish',
    requiredPermission: Permission.PORTFOLIO_PUBLISH,
    category: 'mutation',
    successMessage: 'Portfolio published to edge network.',
    analyticsEvent: 'portfolio_published',
    visibility: 'disabled',
  },
  'portfolio.delete': {
    id: 'portfolio.delete',
    requiredPermission: Permission.PORTFOLIO_DELETE,
    category: 'destructive',
    dangerous: true,
    requiresConfirmation: true,
    confirmationStyle: 'danger',
    confirmationTitle: 'Delete Project',
    confirmationMessage: 'Are you sure you want to permanently delete this portfolio project?',
    confirmButtonLabel: 'Delete Project',
    cancelButtonLabel: 'Cancel',
    successMessage: 'Project deleted successfully.',
    analyticsEvent: 'portfolio_deleted',
    visibility: 'disabled',
  },
  'media.upload': {
    id: 'media.upload',
    requiredPermission: Permission.MEDIA_UPLOAD,
    category: 'mutation',
    retryable: true,
    successMessage: 'Asset uploaded successfully.',
    analyticsEvent: 'media_uploaded',
    visibility: 'disabled',
  },
  'media.delete': {
    id: 'media.delete',
    requiredPermission: Permission.MEDIA_DELETE,
    category: 'destructive',
    dangerous: true,
    requiresConfirmation: true,
    confirmationStyle: 'danger',
    confirmationTitle: 'Delete Asset',
    confirmationMessage: 'Are you sure you want to delete this asset from the media vault?',
    confirmButtonLabel: 'Delete Asset',
    cancelButtonLabel: 'Cancel',
    successMessage: 'Asset deleted successfully.',
    analyticsEvent: 'media_deleted',
    visibility: 'disabled',
  },
  'crm.proposal': {
    id: 'crm.proposal',
    requiredPermission: Permission.CRM_PROPOSAL,
    category: 'generation',
    successMessage: 'Interactive proposal generated.',
    analyticsEvent: 'proposal_generated',
    visibility: 'disabled',
  },
  'crm.delete': {
    id: 'crm.delete',
    requiredPermission: Permission.CRM_DELETE,
    category: 'destructive',
    dangerous: true,
    requiresConfirmation: true,
    confirmationStyle: 'danger',
    confirmationTitle: 'Delete Lead',
    confirmationMessage: 'Are you sure you want to remove this lead from the pipeline?',
    confirmButtonLabel: 'Delete Lead',
    cancelButtonLabel: 'Cancel',
    successMessage: 'Lead removed from pipeline.',
    analyticsEvent: 'lead_deleted',
    visibility: 'disabled',
  },
  'cms.publish': {
    id: 'cms.publish',
    requiredPermission: Permission.CMS_PUBLISH,
    category: 'mutation',
    dangerous: false,
    requiresConfirmation: true,
    confirmationStyle: 'default',
    confirmationTitle: 'Publish Website',
    confirmationMessage: 'Ready to invalidate cache and push changes to edge production?',
    confirmButtonLabel: 'Publish Now',
    cancelButtonLabel: 'Review First',
    successMessage: 'Website changes published.',
    analyticsEvent: 'cms_published',
    visibility: 'disabled',
  },
  'cms.rollback': {
    id: 'cms.rollback',
    requiredPermission: Permission.CMS_ROLLBACK,
    category: 'mutation',
    dangerous: true,
    requiresConfirmation: true,
    confirmationStyle: 'warning',
    confirmationTitle: 'Rollback Website',
    confirmationMessage: 'Are you sure you want to revert production to the previous snapshot?',
    confirmButtonLabel: 'Rollback Now',
    cancelButtonLabel: 'Cancel',
    successMessage: 'Website rollback completed.',
    analyticsEvent: 'cms_rollbacked',
    visibility: 'disabled',
  },
  'ai.scout': {
    id: 'ai.scout',
    requiredPermission: Permission.AI_SCOUT,
    category: 'generation',
    retryable: true,
    successMessage: 'ScoutAI diagnostic scan completed.',
    analyticsEvent: 'ai_scanned',
    visibility: 'disabled',
  },
  'users.manage': {
    id: 'users.manage',
    requiredPermission: Permission.SYSTEM_USERS,
    category: 'mutation',
    dangerous: true,
    requiresConfirmation: true,
    confirmationStyle: 'danger',
    confirmationTitle: 'Revoke Access',
    confirmationMessage: 'Are you sure you want to revoke access for this user?',
    confirmButtonLabel: 'Revoke Access',
    cancelButtonLabel: 'Cancel',
    successMessage: 'User access revoked.',
    analyticsEvent: 'user_revoked',
    visibility: 'disabled',
  },
};
