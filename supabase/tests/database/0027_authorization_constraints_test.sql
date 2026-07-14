BEGIN;
SELECT plan(15);

-- Phase C2 Tests: Authorization Constraints & Indexes

-- Check foreign keys
SELECT col_is_fk('public', 'roles', 'organization_id', 'roles.organization_id should have FK to organizations');
SELECT col_is_fk('public', 'role_permissions', 'role_id', 'role_permissions.role_id should have FK to roles');
SELECT col_is_fk('public', 'role_permissions', 'permission_id', 'role_permissions.permission_id should have FK to permissions');

SELECT col_is_fk('public', 'user_roles', 'user_id', 'user_roles.user_id should have FK to auth.users');
SELECT col_is_fk('public', 'user_roles', 'role_id', 'user_roles.role_id should have FK to roles');
SELECT col_is_fk('public', 'user_roles', 'organization_id', 'user_roles.organization_id should have FK to organizations');

SELECT col_is_fk('public', 'permission_group_permissions', 'group_id', 'permission_group_permissions.group_id should have FK to groups');
SELECT col_is_fk('public', 'permission_group_permissions', 'permission_id', 'permission_group_permissions.permission_id should have FK to permissions');

SELECT col_is_fk('public', 'role_permission_groups', 'role_id', 'role_permission_groups.role_id should have FK to roles');
SELECT col_is_fk('public', 'role_permission_groups', 'group_id', 'role_permission_groups.group_id should have FK to groups');

SELECT col_is_fk('public', 'authorization_metadata', 'organization_id', 'authorization_metadata.organization_id should have FK to organizations');

-- Check Indexes
SELECT has_index('public', 'roles', 'idx_roles_organization_id', 'organization_id', 'roles should have index on organization_id');
SELECT has_index('public', 'permissions', 'idx_permissions_module', 'module', 'permissions should have index on module');
SELECT has_index('public', 'user_roles', 'idx_user_roles_unique_assignment', ARRAY['user_id', 'role_id', 'organization_id'], 'user_roles should have unique assignment index');

-- Check Constraints
SELECT index_is_unique('public', 'roles', 'roles_organization_name_key', 'roles should have unique constraint on organization_id and name');

SELECT * FROM finish();
ROLLBACK;
