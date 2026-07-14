# StudioHQ Authorization Framework v1.0 — Architecture Complete (Frozen)

This document serves as the single source of truth for Role-Based Access Control (RBAC) and authorization across the StudioHQ platform. It defines the permission model, UI enforcement strategies, and the migration rollout plan.

**Architecture Status: FROZEN**
No more architectural changes to the frontend authorization model should be introduced unless there's a critical flaw. Future feature additions must adhere strictly to the registry-driven model defined below.

---

## 1. Core Philosophy

1. **Permissions over Roles:** Code should never check for roles (e.g., `role === 'ADMIN'`). Code only checks for explicit permissions (e.g., `can('portfolio:delete')`). Roles are merely a collection of permissions assigned to users in the database.
2. **Compact JWTs:** The JWT token only stores the user's `organization_id` and assigned `roles`. It does **not** store the full, expanded list of permissions, ensuring tokens remain small even as the system grows to hundreds of permissions.
3. **Frontend Independence (Crucial):** The frontend never owns authorization policy. It only consumes permissions exposed by the authorization layer. The database remains the canonical source of role-to-permission mappings.
4. **Double Enforcement:** The frontend provides UX enforcement (hiding routes, disabling buttons), while PostgreSQL Row Level Security (RLS) provides actual security enforcement by mapping the JWT's roles to the `role_permissions` table.
5. **Declarative UX Policy:** Every authorization decision in StudioHQ is declarative. Instead of permission logic scattered across pages (`if (can("..."))`), policy is centralized into registries.

---

## 2. Registry-Driven Architecture

StudioHQ relies on a **4-Layer Registry System** to enforce permissions and construct the UI dynamically. Every registry satisfies a consistent contract (e.g., `requiredPermission`).

```text
Authentication
        ↓
Permission Provider
        ↓
Route Registry
        ↓
Sidebar Registry
        ↓
Widget Registry
        ↓
Action Registry
```

### Layer 1: Route Registry (`App.tsx`)
Entire pages are protected at the routing layer. The `ADMIN_ROUTES` array maps every route to its `requiredPermission`. If unauthorized, `<PermissionGuard>` intercepts and displays a 403 Fallback.

### Layer 2: Sidebar Registry (`StudioHQLayout.tsx`)
The `ADMIN_SIDEBAR_CONFIG` maps navigation items to their `requiredPermission`. Unauthorized items are completely filtered out, preventing users from seeing dead links. Sections that become empty are automatically hidden.

### Layer 3: Widget Registry (`widgetRegistry.tsx`)
The dashboard is adaptive. Widgets are registered with a `requiredPermission` and `order`. The dashboard loops over the registry, filters unauthorized widgets, and automatically packs the remaining authorized widgets into a CSS Grid. Error boundaries and independent fetching ensure failures don't cascade.

### Layer 4: Action Registry (`actionRegistry.ts`)
Interactive elements (buttons, forms) are governed by the `ACTION_REGISTRY`. The generic `<ActionButton actionId="...">` component looks up the configuration to:
- Verify authorization (disabling or hiding the button).
- Handle async execution (`isExecuting` states).
- Render `ConfirmationDialog` for actions marked `requiresConfirmation: true`.
- Log `console.debug` analytics for the interaction.

---

## 3. Implementation Patterns

From this point onward, every new module should follow the established pattern:
1. **Define Permission:** Add required identifiers to `PermissionId`.
2. **Register Route:** Add to `ADMIN_ROUTES`.
3. **Register Sidebar Entry:** Add to `ADMIN_SIDEBAR_CONFIG`.
4. **Register Dashboard Widgets:** Add to `DASHBOARD_WIDGETS` (if any).
5. **Register Actions:** Add entries to `ACTION_REGISTRY`.

### Strictly Prohibited Patterns
- ❌ **Direct Role Checks:** `if (user.role === 'OWNER')` or `role === 'ADMIN'` inside UI feature code. (The only exception is the Auth/Permission Provider backwards-compatibility layer).
- ❌ **Scattered `can()` Checks:** Calling `can('...')` directly in a component's JSX to conditionally render a button. Use `<ActionButton>` or `<PermissionGuard>` instead.
- ❌ **Hardcoded Widget Auth:** Wrapping individual dashboard widgets in `<PermissionGate>`. Use the Widget Registry instead.

---

## 4. Future Expansion (RC2+)

While the current framework is frozen for RC1, the following registries will be introduced in the future using the exact same contract:

1. **Form Field Registry:** Field-level authorization (e.g., locking the "Billing Email" field based on `system:billing` permission).
2. **Command Palette Registry:** Filtering `CMD+K` commands based on permissions.
3. **Search Registry:** Filtering global search results so users only see entities they are authorized to access.

---

## 5. Backend Strategy (Supabase RLS)

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

### Backend Implementation Phases (Pending)

1. **Database Schema:** Create Postgres tables (`roles`, `permissions`, `role_permissions`, `user_roles`).
2. **Auth Integration:** Set up Supabase Auth Hooks to securely inject the user's `roles` array into the JWT upon login/refresh.
3. **RLS Implementation:** Rewrite Supabase RLS policies across all tables to evaluate against the database permission tables based on the JWT role array.
