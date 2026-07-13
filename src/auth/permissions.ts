// =============================================================================
// TECH AMBIANCE STUDIOHQ — ENTERPRISE PERMISSION SYSTEM
// =============================================================================
//
// This file is the SINGLE SOURCE OF TRUTH for all authorization in StudioHQ.
//
// Architecture:
//   User → Role → Permissions → Guards/Components
//
// Rules:
//   1. Permissions are organized by MODULE, not by job title.
//   2. Higher permissions IMPLY lower permissions (hierarchy).
//   3. Multi-role users receive the UNION of all permission sets.
//   4. Scoped filtering (e.g., "only assigned workspace") is handled by
//      Supabase RLS, NOT by the permission system.
//
// =============================================================================

import type { AuthRoleName } from "./types";

// ─── Module Permission Definitions ────────────────────────────────────────────
//
// Each module defines its own permission namespace.
// The string values use the pattern "module:action".

export const Dashboard = {
  READ: "dashboard:read",
  FULL: "dashboard:full",
} as const;

export const Workspace = {
  READ:   "workspace:read",
  WRITE:  "workspace:write",
  MANAGE: "workspace:manage",
  DELETE: "workspace:delete",
} as const;

export const Portfolio = {
  READ:    "portfolio:read",
  WRITE:   "portfolio:write",
  PUBLISH: "portfolio:publish",
  DELETE:  "portfolio:delete",
} as const;

export const CRM = {
  READ:  "crm:read",
  WRITE: "crm:write",
} as const;

export const CMS = {
  READ:  "cms:read",
  WRITE: "cms:write",
} as const;

export const AI = {
  READ:    "ai:read",
  EXECUTE: "ai:execute",
} as const;

export const Media = {
  READ:   "media:read",
  UPLOAD: "media:upload",
  DELETE: "media:delete",
} as const;

export const Finance = {
  READ:   "finance:read",
  MANAGE: "finance:manage",
} as const;

export const Team = {
  READ:   "team:read",
  INVITE: "team:invite",
  MANAGE: "team:manage",
} as const;

export const Organization = {
  READ:   "organization:read",
  MANAGE: "organization:manage",
} as const;

export const Audit = {
  READ: "audit:read",
} as const;

export const Credentials = {
  READ:   "credentials:read",
  MANAGE: "credentials:manage",
} as const;

export const Portal = {
  ACCESS: "portal:access",
} as const;

export const System = {
  MAINTENANCE:   "system:maintenance",
  FEATURE_FLAGS: "system:feature_flags",
  BACKUPS:       "system:backups",
  DEPLOY:        "system:deploy",
} as const;

// ─── Unified Permission Type ──────────────────────────────────────────────────
//
// The Permission type is the union of all module permission string values.
// This gives full compile-time safety — no raw strings anywhere.

export type Permission =
  | typeof Dashboard[keyof typeof Dashboard]
  | typeof Workspace[keyof typeof Workspace]
  | typeof Portfolio[keyof typeof Portfolio]
  | typeof CRM[keyof typeof CRM]
  | typeof CMS[keyof typeof CMS]
  | typeof AI[keyof typeof AI]
  | typeof Media[keyof typeof Media]
  | typeof Finance[keyof typeof Finance]
  | typeof Team[keyof typeof Team]
  | typeof Organization[keyof typeof Organization]
  | typeof Audit[keyof typeof Audit]
  | typeof Credentials[keyof typeof Credentials]
  | typeof Portal[keyof typeof Portal]
  | typeof System[keyof typeof System];

// ─── All Permissions (for OWNER) ──────────────────────────────────────────────

const ALL_PERMISSIONS: Permission[] = [
  ...Object.values(Dashboard),
  ...Object.values(Workspace),
  ...Object.values(Portfolio),
  ...Object.values(CRM),
  ...Object.values(CMS),
  ...Object.values(AI),
  ...Object.values(Media),
  ...Object.values(Finance),
  ...Object.values(Team),
  ...Object.values(Organization),
  ...Object.values(Audit),
  ...Object.values(Credentials),
  ...Object.values(Portal),
  ...Object.values(System),
];

// ─── Permission Hierarchy (Implied Permissions) ───────────────────────────────
//
// If a user has a higher permission, they automatically receive
// all lower permissions in the same chain.
//
// Example: PORTFOLIO_DELETE → PORTFOLIO_WRITE → PORTFOLIO_READ

const PERMISSION_HIERARCHY: Partial<Record<Permission, Permission[]>> = {
  // Portfolio
  [Portfolio.DELETE]:  [Portfolio.WRITE, Portfolio.READ],
  [Portfolio.PUBLISH]: [Portfolio.WRITE, Portfolio.READ],
  [Portfolio.WRITE]:   [Portfolio.READ],

  // Workspace
  [Workspace.DELETE]: [Workspace.MANAGE, Workspace.WRITE, Workspace.READ],
  [Workspace.MANAGE]: [Workspace.WRITE, Workspace.READ],
  [Workspace.WRITE]:  [Workspace.READ],

  // CRM
  [CRM.WRITE]: [CRM.READ],

  // CMS
  [CMS.WRITE]: [CMS.READ],

  // AI
  [AI.EXECUTE]: [AI.READ],

  // Media
  [Media.DELETE]: [Media.UPLOAD, Media.READ],
  [Media.UPLOAD]: [Media.READ],

  // Finance
  [Finance.MANAGE]: [Finance.READ],

  // Team
  [Team.MANAGE]: [Team.INVITE, Team.READ],
  [Team.INVITE]: [Team.READ],

  // Organization
  [Organization.MANAGE]: [Organization.READ],

  // Credentials
  [Credentials.MANAGE]: [Credentials.READ],

  // Dashboard
  [Dashboard.FULL]: [Dashboard.READ],
};

// ─── Reusable Permission Groups ───────────────────────────────────────────────
//
// Composable building blocks for role definitions.
// These reduce duplication and make the ROLE_PERMISSIONS map readable.

/** Full portfolio CRUD + publish */
const PortfolioManager: Permission[] = [
  Portfolio.DELETE, Portfolio.PUBLISH, Portfolio.WRITE, Portfolio.READ,
];

/** Portfolio create/edit without publish or delete */
const PortfolioEditor: Permission[] = [
  Portfolio.WRITE, Portfolio.READ,
];

/** Full media CRUD */
const MediaManager: Permission[] = [
  Media.DELETE, Media.UPLOAD, Media.READ,
];

/** Full CRM access */
const CRMManager: Permission[] = [
  CRM.WRITE, CRM.READ,
];

/** Full CMS access */
const CMSManager: Permission[] = [
  CMS.WRITE, CMS.READ,
];

/** Full workspace management */
const WorkspaceManager: Permission[] = [
  Workspace.DELETE, Workspace.MANAGE, Workspace.WRITE, Workspace.READ,
];

/** Workspace editor (no delete/manage) */
const WorkspaceEditor: Permission[] = [
  Workspace.WRITE, Workspace.READ,
];

/** Full team management */
const TeamManager: Permission[] = [
  Team.MANAGE, Team.INVITE, Team.READ,
];

/** Full AI access */
const AIOperator: Permission[] = [
  AI.EXECUTE, AI.READ,
];

/** Admin console + dashboard read (baseline for all internal roles) */
const InternalBaseline: Permission[] = [
  Dashboard.READ,
  Portal.ACCESS,
];

// ─── Role → Permission Mapping ───────────────────────────────────────────────
//
// This is the CANONICAL role-to-permission mapping for StudioHQ.
// It implements the executive permission matrix.
//
// ┌──────────────────┬───────┬───────┬─────┬──────────┬─────┬────────────┬───────┬────────┐
// │ Module           │ OWNER │ ADMIN │ DEV │ DESIGNER │  PM │ STRATEGIST │ SALES │ CLIENT │
// ├──────────────────┼───────┼───────┼─────┼──────────┼─────┼────────────┼───────┼────────┤
// │ CEO Dashboard    │  ✅   │  👁️   │ 👁️ │   👁️    │ 👁️ │    👁️     │  👁️  │   ❌   │
// │ Workspaces       │  ✅   │  ✅   │ ✏️  │   ✏️    │ ✏️  │    👁️     │  👁️  │ 👁️    │
// │ Portfolio Manager│  ✅   │  ✅   │ ✏️  │   ✏️    │ 👁️ │    👁️     │  👁️  │   ❌   │
// │ CRM Pipeline     │  ✅   │  ✅   │ 👁️ │    ❌    │ 👁️ │    👁️     │  ✅   │   ❌   │
// │ CMS              │  ✅   │  ✅   │ ✏️  │   ✏️    │ 👁️ │    👁️     │   ❌  │   ❌   │
// │ AI Center        │  ✅   │  ✅   │  ✅ │   👁️    │ 👁️ │    👁️     │  👁️  │   ❌   │
// │ Media Vault      │  ✅   │  ✅   │ 👁️ │    ✅    │ 👁️ │    👁️     │  👁️  │ 👁️    │
// │ Finance          │  ✅   │  👁️  │  ❌ │    ❌    │  ❌ │    👁️     │  👁️  │ 👁️    │
// │ Team Management  │  ✅   │  ✅   │  ❌ │    ❌    │  ❌ │     ❌     │   ❌  │   ❌   │
// │ Org Settings     │  ✅   │  👁️  │  ❌ │    ❌    │  ❌ │     ❌     │   ❌  │   ❌   │
// │ Audit Logs       │  ✅   │  👁️  │ 👁️ │    ❌    │  ❌ │     ❌     │   ❌  │   ❌   │
// │ Credentials Vault│  ✅   │  👁️  │ 👁️ │   👁️    │ 👁️ │     ❌     │   ❌  │ 👁️    │
// └──────────────────┴───────┴───────┴─────┴──────────┴─────┴────────────┴───────┴────────┘

export const ROLE_PERMISSIONS: Record<AuthRoleName, Permission[]> = {

  // ── 👑 OWNER — Unrestricted executive access ─────────────────────────────
  OWNER: ALL_PERMISSIONS,

  // ── 🛡 ADMIN — Agency operations head ────────────────────────────────────
  ADMIN: [
    ...InternalBaseline,
    ...WorkspaceManager,
    ...PortfolioManager,
    ...CRMManager,
    ...CMSManager,
    ...AIOperator,
    ...MediaManager,
    ...TeamManager,
    Finance.READ,
    Organization.READ,
    Audit.READ,
    Credentials.READ,
  ],

  // ── 💻 DEVELOPER — Technical execution ───────────────────────────────────
  DEVELOPER: [
    ...InternalBaseline,
    ...WorkspaceEditor,
    ...PortfolioEditor,
    ...CMSManager,
    ...AIOperator,
    CRM.READ,
    Media.READ,
    Audit.READ,
    Credentials.READ,
  ],

  // ── 🎨 DESIGNER — Creative execution ─────────────────────────────────────
  DESIGNER: [
    ...InternalBaseline,
    ...WorkspaceEditor,
    ...PortfolioEditor,
    ...CMSManager,
    ...MediaManager,
    AI.READ,
    Credentials.READ,
  ],

  // ── 📋 PROJECT_MANAGER — Delivery execution ──────────────────────────────
  PROJECT_MANAGER: [
    ...InternalBaseline,
    ...WorkspaceEditor,
    Portfolio.READ,
    CRM.READ,
    CMS.READ,
    AI.READ,
    Media.READ,
    Credentials.READ,
  ],

  // ── 📈 STRATEGIST — Business growth ──────────────────────────────────────
  STRATEGIST: [
    ...InternalBaseline,
    Workspace.READ,
    Portfolio.READ,
    CRM.READ,
    CMS.READ,
    AI.READ,
    Media.READ,
    Finance.READ,
  ],

  // ── 💰 SALES — Lead acquisition ──────────────────────────────────────────
  SALES: [
    ...InternalBaseline,
    Workspace.READ,
    Portfolio.READ,
    ...CRMManager,
    AI.READ,
    Media.READ,
    Finance.READ,
  ],

  // ── 👤 CLIENT — Portal only ──────────────────────────────────────────────
  //
  // Scoped filtering (only assigned workspace, own invoices, project assets)
  // is handled by Supabase RLS — NOT by the permission system.
  CLIENT: [
    Portal.ACCESS,
    Workspace.READ,
    Media.READ,
    Finance.READ,
    Credentials.READ,
  ],
};

// ─── Permission Resolution ───────────────────────────────────────────────────
//
// Expands a set of explicit permissions to include all implied permissions
// from the hierarchy, then returns a Set<Permission> for O(1) lookups.

export function resolvePermissions(roles: AuthRoleName[]): Set<Permission> {
  const granted = new Set<Permission>();

  // 1. Collect all explicit permissions from all roles
  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      for (const p of rolePerms) {
        granted.add(p);
      }
    }
  }

  // 2. Expand implied permissions from the hierarchy
  //    Iterate until no new permissions are added (handles multi-level chains)
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
