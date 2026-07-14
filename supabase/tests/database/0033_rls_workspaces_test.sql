BEGIN;

SELECT plan(21);

-- 1. Verify Expected Tables Exist
SELECT has_table('public', 'organizations', 'organizations table exists');
SELECT has_table('public', 'workspaces', 'workspaces table exists');
SELECT has_table('public', 'organization_members', 'organization_members table exists');
SELECT has_table('public', 'workspace_members', 'workspace_members table exists');
SELECT has_table('public', 'invitations', 'invitations table exists');

-- 2. Verify RLS is Enabled
SELECT results_eq(
    $$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations' $$,
    $$ VALUES (true) $$,
    'RLS is enabled on organizations'
);
SELECT results_eq(
    $$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workspaces' $$,
    $$ VALUES (true) $$,
    'RLS is enabled on workspaces'
);

-- 3. Setup Mock Users and Roles for Testing
-- Org A and Org B
INSERT INTO public.organizations (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Test Org A', 'test-org-a'),
  ('00000000-0000-0000-0000-000000000002', 'Test Org B', 'test-org-b')
ON CONFLICT DO NOTHING;

INSERT INTO public.workspaces (id, organization_id, name, slug) VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Workspace A', 'workspace-a'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Workspace B', 'workspace-b')
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, is_system) VALUES ('TEST_WORKSPACE_READER', false), ('TEST_WORKSPACE_WRITER', false);
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'workspace:read' FROM public.roles WHERE name IN ('TEST_WORKSPACE_READER', 'TEST_WORKSPACE_WRITER');
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'workspace:write' FROM public.roles WHERE name = 'TEST_WORKSPACE_WRITER';

-- Create deterministic UUIDs for users with unique raw_user_meta_data to avoid trigger slug collisions
INSERT INTO auth.users (id, role, aud, email, raw_user_meta_data) VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'writer_a@test.com', '{"full_name": "Writer A"}'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'reader_a@test.com', '{"full_name": "Reader A"}'),
    ('cccccccc-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'writer_b@test.com', '{"full_name": "Writer B"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'aaaaaaaa-0000-0000-0000-000000000001', id, '00000000-0000-0000-0000-000000000001' FROM public.roles WHERE name = 'TEST_WORKSPACE_WRITER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'bbbbbbbb-0000-0000-0000-000000000002', id, '00000000-0000-0000-0000-000000000001' FROM public.roles WHERE name = 'TEST_WORKSPACE_READER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'cccccccc-0000-0000-0000-000000000003', id, '00000000-0000-0000-0000-000000000002' FROM public.roles WHERE name = 'TEST_WORKSPACE_WRITER'
ON CONFLICT DO NOTHING;


-- 4. Test Anonymous Access (Public)
SET LOCAL ROLE anon;

SELECT throws_ok(
    $$ SELECT count(*)::int FROM organizations $$,
    'permission denied for table organizations',
    'Anonymous users cannot view organizations'
);
SELECT throws_ok(
    $$ SELECT count(*)::int FROM workspaces $$,
    'permission denied for table workspaces',
    'Anonymous users cannot view workspaces'
);


-- 5. Test Missing Permission (Correct Tenant)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000999", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000001"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001' $$,
    $$ VALUES (0) $$,
    'Missing Permission: Authenticated user without workspace:read cannot see their own organization'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM workspaces WHERE organization_id = '00000000-0000-0000-0000-000000000001' $$,
    $$ VALUES (0) $$,
    'Missing Permission: Authenticated user without workspace:read cannot see their own workspaces'
);

-- 6. Test Wrong Tenant (Correct Permission)
-- User B has permission in Org B, but we test their access against Org A
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-0000-0000-0000-000000000003", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000002"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001' $$,
    $$ VALUES (0) $$,
    'Cross Tenant: User from Org B cannot read Org A'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM workspaces WHERE organization_id = '00000000-0000-0000-0000-000000000001' $$,
    $$ VALUES (0) $$,
    'Cross Tenant: User from Org B cannot read Workspaces in Org A'
);
-- Test tenant reassignment failure for Org B user trying to steal a workspace
SELECT results_eq(
    $$ UPDATE workspaces SET organization_id = '00000000-0000-0000-0000-000000000002' WHERE id = '11111111-1111-1111-1111-111111111111' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Cross Tenant: Cannot update a workspace belonging to another tenant'
);


-- 7. Test Read Permissions (Correct Tenant)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-0000-0000-0000-000000000002", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000001"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001' $$,
    $$ VALUES (1) $$,
    'Reader A can see their own Organization'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM workspaces WHERE organization_id = '00000000-0000-0000-0000-000000000001' $$,
    $$ VALUES (1) $$,
    'Reader A can see Workspaces in their own Organization'
);
-- Should NOT be able to insert organization
SELECT throws_ok(
    $$ INSERT INTO organizations (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000999', 'Hacked Org', 'hacked') $$,
    'new row violates row-level security policy for table "organizations"',
    'Organizations cannot be inserted via RLS (RPC only)'
);
-- Should NOT be able to update
SELECT results_eq(
    $$ UPDATE workspaces SET name = 'Hacked' WHERE id = '11111111-1111-1111-1111-111111111111' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Reader A cannot update Workspace'
);

-- 8. Test Write Permissions (Correct Tenant)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000001", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000001"}}', true);

SELECT results_eq(
    $$ UPDATE workspaces SET name = 'Updated Workspace A' WHERE id = '11111111-1111-1111-1111-111111111111' RETURNING name $$,
    $$ VALUES ('Updated Workspace A'::text) $$,
    'Writer A can update their own Workspace'
);

-- Tenant reassignment test: Writer A (Org A) tries to reassign their workspace to Org B
-- This will fail the WITH CHECK clause because Writer A cannot access Org B!
SELECT throws_ok(
    $$ UPDATE workspaces SET organization_id = '00000000-0000-0000-0000-000000000002' WHERE id = '11111111-1111-1111-1111-111111111111' $$,
    'new row violates row-level security policy for table "workspaces"',
    'Tenant Reassignment: User cannot change a workspace to an organization they do not own'
);

-- Should NOT be able to delete organizations
SELECT results_eq(
    $$ DELETE FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Organizations cannot be deleted via RLS (RPC only)'
);

SELECT * FROM finish();
ROLLBACK;
