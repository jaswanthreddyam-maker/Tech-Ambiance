# StudioHQ Authorization Architecture

This document serves as the single source of truth for Role-Based Access Control (RBAC) and authorization across the StudioHQ platform. It defines the permission model, UI enforcement strategies, and the migration rollout plan.

---

## 1. Core Philosophy

1. **Permissions over Roles:** Code should never check for roles (e.g., `role === 'ADMIN'`). Code only checks for explicit permissions (e.g., `can('portfolio:delete')`). Roles are merely a collection of permissions assigned to users in the database.
2. **Compact JWTs:** The JWT token only stores the user's `organization_id` and assigned `roles`. It does **not** store the full, expanded list of permissions, ensuring tokens remain small even as the system grows to hundreds of permissions.
3. **Frontend Independence (Crucial): The frontend never owns authorization policy. It only consumes permissions exposed by the authorization layer. The database remains the canonical source of role-to-permission mappings.**
4. **Double Enforcement:** The frontend provides UX enforcement (hiding routes, disabling buttons), while PostgreSQL Row Level Security (RLS) provides actual security enforcement by mapping the JWT's roles to the `role_permissions` table.
5. **Adaptive UX:** The dashboard and sidebar dynamically adapt to the user's permissions. Users never see empty pages for modules they don't have access to; instead, the UI is tailored specifically to their domain (e.g., Sales sees only CRM).

---

## 2. Permission Model

Permissions are defined as standard `module:action` string literals. They are grouped logically for easy assignment to roles.

### Permission Definitions & Metadata

To support future admin UIs, audit logs, and documentation, every permission defines explicit metadata.

```ts
export type PermissionId = 
  // Portfolio
  | 'portfolio:read' | 'portfolio:write' | 'portfolio:delete' | 'portfolio:publish'
  // CRM
  | 'crm:read' | 'crm:write' | 'crm:delete' | 'crm:export' | 'crm:proposal'
  // Workspaces
  | 'workspace:read' | 'workspace:write' | 'workspace:delete' | 'workspace:provision'
  // Media
  | 'media:read' | 'media:upload' | 'media:delete'
  // AI Center
  | 'ai:scout' | 'ai:generate'
  // CMS
  | 'cms:read' | 'cms:edit' | 'cms:publish' | 'cms:rollback'
  // System
  | 'system:audit' | 'system:roles' | 'system:users' | 'system:billing';

export interface PermissionMetadata {
  id: PermissionId;
  name: string;
  description: string;
  module: 'Portfolio' | 'CRM' | 'Workspaces' | 'Media' | 'AI' | 'CMS' | 'System';
  dangerous?: boolean;
}
```

### Permission Groups

Rather than assigning hundreds of individual permissions to a role, we maintain reusable permission groups:

```ts
export const PortfolioPermissions: PermissionId[] = [
  'portfolio:read', 'portfolio:write', 'portfolio:delete', 'portfolio:publish'
];

export const CRMPermissions: PermissionId[] = [
  'crm:read', 'crm:write', 'crm:delete', 'crm:export', 'crm:proposal'
];

export const SystemPermissions: PermissionId[] = [
  'system:audit', 'system:roles', 'system:users', 'system:billing'
];
```

### Role-to-Permission Mapping (Database Owned)

**Important:** Role-to-permission mappings are owned entirely by the database. TypeScript defines permission identifiers and metadata only. The frontend requests the permissions for the current user's roles from the backend.

```text
Database
├── roles
├── permissions
└── role_permissions
      ↓
PermissionProvider
      ↓
React Component
```

### Permission Versioning

To handle cases where permissions are added or revoked while a user is actively logged in, the system uses a `permissions_version` concept.
When a user's roles or permissions are updated in the database, their `permissions_version` increments. The frontend can detect this (e.g., via a Realtime subscription or on JWT refresh) and trigger a re-fetch in the `PermissionProvider`, ensuring no stale access is permitted.

---

## 3. UI Strategy

### The `usePermissions` Hook

The frontend relies entirely on a React Context provider that fetches the user's permissions once upon login and caches them.

```ts
const { can, canAny, canAll, permissions } = usePermissions();

if (can('portfolio:delete')) {
  // proceed
}
```

### Route Protection

Entire pages are protected at the routing layer.

```tsx
<PermissionGuard permission="portfolio:read">
  <PortfolioPage />
</PermissionGuard>
```

### Module Registration

Instead of updating sidebar config, routing, and dashboards independently, StudioHQ uses a central **Module Registry**. Adding a new module automatically wires it throughout the application based on permissions.

```ts
// Conceptual Example
export const ModuleRegistry = {
  Portfolio: {
    label: "Portfolio",
    route: "/admin/portfolio",
    permission: "portfolio:read",
    dashboardWidgets: [PortfolioStatsWidget],
    sidebarGroup: "AGENCY PRODUCTS"
  },
  CRM: {
    label: "CRM Pipeline",
    route: "/admin/crm",
    permission: "crm:read",
    dashboardWidgets: [PipelineValueWidget],
    sidebarGroup: "AGENCY PRODUCTS"
  }
};
```

### Component & Action Protection

If an action (like a button) requires a specific permission, it is rendered in a **disabled state with a tooltip** rather than being hidden completely. This improves discoverability.

```tsx
<button 
  disabled={!can('portfolio:delete')}
  title={!can('portfolio:delete') ? "Requires 'portfolio:delete' permission" : ""}
>
  Delete Project
</button>
```

---

## 4. Backend Strategy (Supabase RLS)

### JWT Claims

The Supabase JWT remains extremely lightweight:

```json
{
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "organization_id": "org_123",
    "roles": ["ADMIN"]
  }
}
```

### RLS Philosophy

Row Level Security policies use the roles in the JWT to lookup permissions in the database securely and rapidly. By using Postgres Functions or a joined view, RLS evaluates if the user's roles intersect with the roles mapped to a given permission.

---

## 5. Migration Rollout Plan

To safely migrate StudioHQ from its current hardcoded `role === 'OWNER'` checks to the enterprise RBAC system, we will execute the following phased rollout:

### Phase A: Architecture Definition
- Define TypeScript permission types, metadata, and groups.
- Implement the `usePermissions()` hook with a temporary compatibility layer (e.g., `if (user.role === 'OWNER') return true`).
- Create `<PermissionGuard />` and `<PermissionGate />` components.

### Phase B: UI Migration
- Refactor the sidebar to be data-driven based on permissions.
- Wrap all `/admin/*` routes in `<PermissionGuard>`.
- Audit all destructive actions (buttons/forms) and implement `disabled={!can(...)}`.
- Implement adaptive dashboard widgets.

### Phase C: Database Schema
- Create Postgres tables: `roles`, `permissions`, `role_permissions`, and `user_roles`.
- Seed the initial permission taxonomy and role mappings.

### Phase D: Auth Integration
- Set up Supabase Auth Hooks (or user metadata triggers) to securely inject the user's `roles` array into the JWT upon login/refresh.
- Update the frontend permission provider to fetch the explicit permission list from the database using the assigned roles.

### Phase E: RLS Implementation
- Rewrite Supabase RLS policies across all tables to evaluate against the database permission tables based on the JWT role array.
- Write backend pgTAP unit tests to verify access denial.

### Phase F: Finalization
- Completely remove the temporary compatibility layer from `usePermissions()`.
- StudioHQ is now fully governed by explicit permissions across both UI and database layers.
