# StudioHQ Authorization Schema Specification (Phase C0.5)

This document defines the exact database schema for the StudioHQ authorization framework. No migrations will be written until this specification is frozen.

---

## 1. Tables: Core Authorization

### 1.1 `roles`
Stores all system and tenant-specific roles.

**Columns**
* `id` (uuid, Primary Key, Default: `gen_random_uuid()`)
* `organization_id` (uuid, Nullable, Foreign Key to `organizations.id` if tenant exists)
* `name` (text, Not Null)
* `description` (text, Nullable)
* `is_system` (boolean, Not Null, Default: `false`)
* `created_at` (timestamptz, Not Null, Default: `now()`)
* `updated_at` (timestamptz, Not Null, Default: `now()`)

**Constraints & Foreign Keys**
* `UNIQUE(organization_id, name)` (prevent duplicate role names per tenant)
* FK `organization_id` -> `organizations.id` (`ON DELETE CASCADE`)

**Indexes**
* `INDEX idx_roles_organization_id (organization_id)`

---

### 1.2 `permissions`
The canonical dictionary of permissions, synced from `permissions.yaml`.

**Columns**
* `id` (text, Primary Key) - Natural key e.g., `portfolio:read`
* `module` (text, Not Null)
* `name` (text, Not Null)
* `description` (text, Nullable)
* `dangerous` (boolean, Not Null, Default: `false`)
* `created_at` (timestamptz, Not Null, Default: `now()`)

**Constraints & Foreign Keys**
* (None)

**Indexes**
* `INDEX idx_permissions_module (module)`

---

### 1.3 `role_permissions`
Direct assignments of permissions to roles.

**Columns**
* `role_id` (uuid, Not Null)
* `permission_id` (text, Not Null)

**Constraints & Foreign Keys**
* `PRIMARY KEY (role_id, permission_id)`
* FK `role_id` -> `roles.id` (`ON DELETE CASCADE`, `ON UPDATE CASCADE`)
* FK `permission_id` -> `permissions.id` (`ON DELETE CASCADE`, `ON UPDATE CASCADE`)

**Indexes**
* `INDEX idx_role_permissions_role_id (role_id)`
* `INDEX idx_role_permissions_permission_id (permission_id)`

---

### 1.4 `user_roles`
Assignments of roles to specific users, scoped by tenant.

**Columns**
* `user_id` (uuid, Not Null)
* `role_id` (uuid, Not Null)
* `organization_id` (uuid, Nullable)

**Constraints & Foreign Keys**
* `PRIMARY KEY (user_id, role_id, organization_id)` (Null safe logic requires specific UNIQUE constraint if standard PK behavior is problematic, we use standard coalesce logic if needed, but here `organization_id` might be null for global owner)
* `UNIQUE NULLS NOT DISTINCT (user_id, role_id, organization_id)`
* FK `user_id` -> `auth.users.id` (`ON DELETE CASCADE`)
* FK `role_id` -> `roles.id` (`ON DELETE CASCADE`)
* FK `organization_id` -> `organizations.id` (`ON DELETE CASCADE`)

**Indexes**
* `INDEX idx_user_roles_user_id (user_id)`
* `INDEX idx_user_roles_role_id (role_id)`
* `INDEX idx_user_roles_organization_id (organization_id)`

---

## 2. Tables: Permission Groups

### 2.1 `permission_groups`
Reusable bundles of permissions.

**Columns**
* `id` (uuid, Primary Key, Default: `gen_random_uuid()`)
* `name` (text, Not Null)
* `description` (text, Nullable)
* `created_at` (timestamptz, Not Null, Default: `now()`)

**Constraints & Foreign Keys**
* `UNIQUE(name)`

---

### 2.2 `permission_group_permissions`
Links groups to individual permissions.

**Columns**
* `group_id` (uuid, Not Null)
* `permission_id` (text, Not Null)

**Constraints & Foreign Keys**
* `PRIMARY KEY (group_id, permission_id)`
* FK `group_id` -> `permission_groups.id` (`ON DELETE CASCADE`)
* FK `permission_id` -> `permissions.id` (`ON DELETE CASCADE`)

**Indexes**
* `INDEX idx_group_perms_group_id (group_id)`

---

### 2.3 `role_permission_groups`
Assigns a bundle of permissions to a role.

**Columns**
* `role_id` (uuid, Not Null)
* `group_id` (uuid, Not Null)

**Constraints & Foreign Keys**
* `PRIMARY KEY (role_id, group_id)`
* FK `role_id` -> `roles.id` (`ON DELETE CASCADE`)
* FK `group_id` -> `permission_groups.id` (`ON DELETE CASCADE`)

**Indexes**
* `INDEX idx_role_groups_role_id (role_id)`
* `INDEX idx_role_groups_group_id (group_id)`

---

## 3. Tables: Operational & Telemetry

### 3.1 `authorization_metadata`
Tenant versioning for cache invalidation.

**Columns**
* `organization_id` (uuid, Primary Key)
* `version` (int, Not Null, Default: `1`)
* `updated_at` (timestamptz, Not Null, Default: `now()`)

**Constraints & Foreign Keys**
* FK `organization_id` -> `organizations.id` (`ON DELETE CASCADE`)

---

### 3.2 `authorization_audit`
High-volume security decision logs (access granted/denied).

**Columns**
* `id` (uuid, Primary Key, Default: `gen_random_uuid()`)
* `user_id` (uuid, Nullable)
* `organization_id` (uuid, Nullable)
* `permission_id` (text, Not Null)
* `resource_type` (text, Nullable)
* `resource_id` (text, Nullable)
* `decision` (text, Not Null) - e.g., 'Granted', 'Denied'
* `decision_source` (text, Not Null) - e.g., 'RLS', 'Edge', 'API'
* `reason` (text, Nullable)
* `ip_address` (inet, Nullable)
* `user_agent` (text, Nullable)
* `created_at` (timestamptz, Not Null, Default: `now()`)

**Indexes**
* `INDEX idx_auth_audit_user_id (user_id)`
* `INDEX idx_auth_audit_org_id (organization_id)`
* `INDEX idx_auth_audit_created_at (created_at)`

---

### 3.3 `authorization_events`
Low-volume configuration tracking (role creation, assignment).

**Columns**
* `id` (uuid, Primary Key, Default: `gen_random_uuid()`)
* `organization_id` (uuid, Nullable)
* `actor_id` (uuid, Nullable) - user who made the change
* `action` (text, Not Null) - e.g., 'ROLE_CREATED', 'USER_ASSIGNED_ROLE'
* `target_type` (text, Not Null) - e.g., 'ROLE', 'USER'
* `target_id` (text, Not Null)
* `metadata` (jsonb, Nullable) - old/new state
* `created_at` (timestamptz, Not Null, Default: `now()`)

**Indexes**
* `INDEX idx_auth_events_org_id (organization_id)`
* `INDEX idx_auth_events_created_at (created_at)`

---

### 3.4 `authorization_migrations`
Tracks taxonomy syncing from the YAML generator.

**Columns**
* `version` (int, Primary Key)
* `applied_at` (timestamptz, Not Null, Default: `now()`)
* `checksum` (text, Not Null)
* `generator_version` (text, Not Null)

---

## 4. Functions & Views Strategy

### 4.1 SQL View: `effective_permissions`
We will use a standard SQL VIEW instead of materialized or direct joins per-call. This provides the best mix of simplicity and instant cache freshness.

```sql
CREATE OR REPLACE VIEW effective_permissions AS
-- Direct Role Permissions
SELECT ur.user_id, ur.organization_id, rp.permission_id, r.name as role_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
UNION
-- Group Role Permissions
SELECT ur.user_id, ur.organization_id, pgp.permission_id, r.name as role_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permission_groups rpg ON r.id = rpg.role_id
JOIN permission_group_permissions pgp ON rpg.group_id = pgp.group_id;
```

### 4.2 SQL View: `effective_role_assignments`
For admin dashboard visibility.

```sql
CREATE OR REPLACE VIEW effective_role_assignments AS
SELECT ur.user_id, ur.organization_id, r.id as role_id, r.name as role_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id;
```

### 4.3 Function: `has_permission()`
Optimized standard function.

```sql
CREATE OR REPLACE FUNCTION has_permission(p_permission text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM effective_permissions ep
    WHERE ep.user_id = auth.uid() AND ep.permission_id = p_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
