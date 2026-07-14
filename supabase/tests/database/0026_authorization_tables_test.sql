BEGIN;
SELECT plan(10);

-- Phase C1 Tests: Authorization Tables Existence
SELECT has_table('roles', 'Table roles should exist');
SELECT has_table('permissions', 'Table permissions should exist');
SELECT has_table('role_permissions', 'Table role_permissions should exist');
SELECT has_table('user_roles', 'Table user_roles should exist');
SELECT has_table('permission_groups', 'Table permission_groups should exist');
SELECT has_table('permission_group_permissions', 'Table permission_group_permissions should exist');
SELECT has_table('role_permission_groups', 'Table role_permission_groups should exist');
SELECT has_table('authorization_metadata', 'Table authorization_metadata should exist');
SELECT has_table('authorization_audit', 'Table authorization_audit should exist');
SELECT has_table('authorization_events', 'Table authorization_events should exist');

SELECT * FROM finish();
ROLLBACK;
