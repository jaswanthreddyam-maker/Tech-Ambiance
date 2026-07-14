import type { AuthRoleName } from "./types";
import { Permission, type PermissionId } from './registry/permissions';

/** Full portfolio CRUD + publish */
const PortfolioManager: PermissionId[] = [
  Permission.PORTFOLIO_DELETE, Permission.PORTFOLIO_PUBLISH, Permission.PORTFOLIO_WRITE, Permission.PORTFOLIO_READ,
];

/** Portfolio create/edit without publish or delete */
const PortfolioEditor: PermissionId[] = [
  Permission.PORTFOLIO_WRITE, Permission.PORTFOLIO_READ,
];

/** Full media CRUD */
const MediaManager: PermissionId[] = [
  Permission.MEDIA_DELETE, Permission.MEDIA_UPLOAD, Permission.MEDIA_READ,
];

/** Full CRM access */
const CRMManager: PermissionId[] = [
  Permission.CRM_WRITE, Permission.CRM_READ,
];

/** Full CMS access */
const CMSManager: PermissionId[] = [
  Permission.CMS_EDIT, Permission.CMS_READ,
];

/** Full workspace management */
const WorkspaceManager: PermissionId[] = [
  Permission.WORKSPACE_DELETE, Permission.WORKSPACE_PROVISION, Permission.WORKSPACE_WRITE, Permission.WORKSPACE_READ,
];

/** Workspace editor (no delete/manage) */
const WorkspaceEditor: PermissionId[] = [
  Permission.WORKSPACE_WRITE, Permission.WORKSPACE_READ,
];

/** Full team management */
const TeamManager: PermissionId[] = [
  Permission.SYSTEM_USERS, Permission.SYSTEM_ROLES, Permission.SYSTEM_READ,
];

/** Full AI access */
const AIOperator: PermissionId[] = [
  Permission.AI_SCOUT, Permission.AI_GENERATE, Permission.AI_READ,
];

/** Admin console + dashboard read (baseline for all internal roles) */
const InternalBaseline: PermissionId[] = [
  Permission.DASHBOARD_READ,
];

export const ROLE_PERMISSIONS: Record<AuthRoleName, PermissionId[]> = {
  OWNER: Object.values(Permission) as PermissionId[],
  ADMIN: [
    ...InternalBaseline,
    ...WorkspaceManager,
    ...PortfolioManager,
    ...CRMManager,
    ...CMSManager,
    ...AIOperator,
    ...MediaManager,
    ...TeamManager,
    Permission.SYSTEM_READ,
    Permission.SYSTEM_AUDIT,
    Permission.SYSTEM_BILLING,
  ],
  DEVELOPER: [
    ...InternalBaseline,
    ...WorkspaceEditor,
    ...PortfolioEditor,
    ...CMSManager,
    ...AIOperator,
    Permission.CRM_READ,
    Permission.MEDIA_READ,
    Permission.SYSTEM_AUDIT,
  ],
  DESIGNER: [
    ...InternalBaseline,
    ...WorkspaceEditor,
    ...PortfolioEditor,
    ...CMSManager,
    ...MediaManager,
    Permission.AI_READ,
  ],
  PROJECT_MANAGER: [
    ...InternalBaseline,
    ...WorkspaceEditor,
    Permission.PORTFOLIO_READ,
    Permission.CRM_READ,
    Permission.CMS_READ,
    Permission.AI_READ,
    Permission.MEDIA_READ,
  ],
  STRATEGIST: [
    ...InternalBaseline,
    Permission.WORKSPACE_READ,
    Permission.PORTFOLIO_READ,
    Permission.CRM_READ,
    Permission.CMS_READ,
    Permission.AI_READ,
    Permission.MEDIA_READ,
    Permission.ANALYTICS_FINANCE,
  ],
  SALES: [
    ...InternalBaseline,
    Permission.WORKSPACE_READ,
    Permission.PORTFOLIO_READ,
    ...CRMManager,
    Permission.AI_READ,
    Permission.MEDIA_READ,
    Permission.ANALYTICS_FINANCE,
  ],
  CLIENT: [
    Permission.WORKSPACE_READ,
    Permission.MEDIA_READ,
    Permission.ANALYTICS_FINANCE,
  ],
};

// Simplified implied permissions hierarchy
const PERMISSION_HIERARCHY: Partial<Record<PermissionId, PermissionId[]>> = {
  [Permission.PORTFOLIO_DELETE]:  [Permission.PORTFOLIO_WRITE, Permission.PORTFOLIO_READ],
  [Permission.PORTFOLIO_PUBLISH]: [Permission.PORTFOLIO_WRITE, Permission.PORTFOLIO_READ],
  [Permission.PORTFOLIO_WRITE]:   [Permission.PORTFOLIO_READ],
  [Permission.WORKSPACE_DELETE]:  [Permission.WORKSPACE_PROVISION, Permission.WORKSPACE_WRITE, Permission.WORKSPACE_READ],
  [Permission.WORKSPACE_PROVISION]: [Permission.WORKSPACE_WRITE, Permission.WORKSPACE_READ],
  [Permission.WORKSPACE_WRITE]:   [Permission.WORKSPACE_READ],
  [Permission.CRM_WRITE]:         [Permission.CRM_READ],
  [Permission.CMS_EDIT]:         [Permission.CMS_READ],
  [Permission.MEDIA_DELETE]:      [Permission.MEDIA_UPLOAD, Permission.MEDIA_READ],
  [Permission.MEDIA_UPLOAD]:      [Permission.MEDIA_READ],
};

export function resolvePermissions(roles: AuthRoleName[]): Set<PermissionId> {
  const granted = new Set<PermissionId>();

  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      for (const p of rolePerms) granted.add(p);
    }
  }

  let expanded = true;
  while (expanded) {
    expanded = false;
    for (const p of Array.from(granted)) {
      const implied = PERMISSION_HIERARCHY[p];
      if (implied) {
        for (const ip of implied) {
          if (!granted.has(ip)) {
            granted.add(ip);
            expanded = true;
          }
        }
      }
    }
  }

  return granted;
}
