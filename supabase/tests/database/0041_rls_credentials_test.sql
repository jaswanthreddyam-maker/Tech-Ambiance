-- ==============================================================================
-- TEST: 0041_rls_credentials_test.sql
-- ==============================================================================
-- Validates Credentials Module RLS additive policies and schema split.
-- ==============================================================================

BEGIN;

SELECT plan(23);

-- 1. Verify Expected Tables Exist
SELECT has_table('public', 'project_credentials', 'project_credentials table exists');
SELECT has_table('public', 'project_credential_secrets', 'project_credential_secrets table exists');
SELECT has_table('public', 'project_credential_permissions', 'project_credential_permissions table exists');
SELECT has_table('public', 'project_credential_audit_logs', 'project_credential_audit_logs table exists');

-- 2. Mock Org, Workspace, Project
INSERT INTO public.organizations (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Test Org', 'test-org'),
  ('00000000-0000-0000-0000-000000000001', 'Foreign Org', 'foreign-org')
ON CONFLICT DO NOTHING;

INSERT INTO public.workspaces (id, organization_id, name, slug) VALUES
  ('11111111-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Test Workspace', 'test-workspace'),
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Foreign Workspace', 'foreign-workspace')
ON CONFLICT DO NOTHING;

INSERT INTO public.projects (id, workspace_id, name, slug, status) VALUES
  ('22222222-3333-4444-5555-666666666666', '11111111-0000-0000-0000-000000000000', 'Test Project', 'test-project', 'Active'),
  ('22222222-3333-4444-5555-666666666667', '11111111-0000-0000-0000-000000000001', 'Foreign Project', 'foreign-project', 'Active')
ON CONFLICT DO NOTHING;

-- 3. Mock Roles & Role Mappings
INSERT INTO public.roles (id, name, description) VALUES
  ('33333333-0000-0000-0000-000000000000', 'Credential Reader', 'Test'),
  ('33333333-0000-0000-0000-000000000001', 'Credential Writer', 'Test'),
  ('33333333-0000-0000-0000-000000000002', 'Credential Rotator', 'Test'),
  ('33333333-0000-0000-0000-000000000003', 'Credential Deleter', 'Test'),
  ('33333333-0000-0000-0000-000000000004', 'Credential Decryptor', 'Test'),
  ('33333333-0000-0000-0000-000000000005', 'Credential Auditor', 'Test')
ON CONFLICT DO NOTHING;

-- Mock user mappings (insert to auth.users to trigger profile creation)
INSERT INTO auth.users (id, role, aud, email, raw_user_meta_data) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@a.com', '{"full_name": "a"}'),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@b.com', '{"full_name": "b"}'),
  ('cccccccc-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'c@c.com', '{"full_name": "c"}'),
  ('dddddddd-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'd@d.com', '{"full_name": "d"}'),
  ('eeeeeeee-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'e@e.com', '{"full_name": "e"}'),
  ('ffffffff-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'f@f.com', '{"full_name": "f"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000000', '33333333-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000'), -- Reader
  ('bbbbbbbb-0000-0000-0000-000000000000', '33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000'), -- Writer
  ('cccccccc-0000-0000-0000-000000000000', '33333333-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000'), -- Rotator
  ('dddddddd-0000-0000-0000-000000000000', '33333333-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000'), -- Deleter
  ('eeeeeeee-0000-0000-0000-000000000000', '33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000'), -- Decryptor
  ('ffffffff-0000-0000-0000-000000000000', '33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000')  -- Auditor
ON CONFLICT DO NOTHING;

-- Map testing roles to specific permissions directly via groups
DO $$
  DECLARE
    g_reader uuid;
    g_writer uuid;
    g_rotator uuid;
    g_deleter uuid;
    g_decryptor uuid;
    g_auditor uuid;
  BEGIN
    INSERT INTO public.permission_groups (name) VALUES 
      ('t_reader'), ('t_writer'), ('t_rotator'), ('t_deleter'), ('t_decryptor'), ('t_auditor');
    
    SELECT id INTO g_reader FROM public.permission_groups WHERE name = 't_reader';
    SELECT id INTO g_writer FROM public.permission_groups WHERE name = 't_writer';
    SELECT id INTO g_rotator FROM public.permission_groups WHERE name = 't_rotator';
    SELECT id INTO g_deleter FROM public.permission_groups WHERE name = 't_deleter';
    SELECT id INTO g_decryptor FROM public.permission_groups WHERE name = 't_decryptor';
    SELECT id INTO g_auditor FROM public.permission_groups WHERE name = 't_auditor';

    INSERT INTO public.role_permission_groups (role_id, group_id) VALUES
      ('33333333-0000-0000-0000-000000000000', g_reader),
      ('33333333-0000-0000-0000-000000000001', g_writer),
      ('33333333-0000-0000-0000-000000000002', g_rotator),
      ('33333333-0000-0000-0000-000000000003', g_deleter),
      ('33333333-0000-0000-0000-000000000004', g_decryptor),
      ('33333333-0000-0000-0000-000000000005', g_auditor);

    INSERT INTO public.permission_group_permissions (permission_id, group_id) VALUES
      ('credentials:read', g_reader),
      ('credentials:write', g_writer),
      ('credentials:read', g_writer), 
      ('credentials:rotate', g_rotator),
      ('credentials:delete', g_deleter),
      ('credentials:read', g_deleter),
      ('credentials:decrypt', g_decryptor),
      ('credentials:read', g_decryptor),
      ('system:audit', g_auditor);
  END
$$;

-- 4. Create a test credential via the system directly
INSERT INTO public.project_credentials (id, project_id, name, category, provider) VALUES
  ('44444444-5555-6666-7777-888888888888', '22222222-3333-4444-5555-666666666666', 'Test Cred', 'Infrastructure', 'LOCAL')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_credential_secrets (credential_id, secret_reference) VALUES
  ('44444444-5555-6666-7777-888888888888', 'vault://test')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TESTS: READER
-- ============================================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM public.project_credentials $$,
    $$ VALUES (1::int) $$,
    'Reader can see credential metadata'
);

SELECT throws_ok(
    $$ SELECT public.reveal_project_credential('44444444-5555-6666-7777-888888888888', 'aaaaaaaa-0000-0000-0000-000000000000') $$,
    'Unauthorized: credentials:decrypt permission required',
    'Secret Read Isolation: Reader cannot decrypt'
);

SELECT is_empty(
    $$ SELECT * FROM public.project_credential_secrets $$,
    'Reader cannot see secrets table (RLS filters all rows)'
);

SELECT results_eq(
    $$ UPDATE public.project_credentials SET description = 'hacked' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Reader cannot edit metadata'
);

SELECT is_empty(
    $$ SELECT * FROM public.project_credential_audit_logs $$,
    'Reader cannot see audit logs'
);

-- ============================================================================
-- TESTS: DECRYPTOR
-- ============================================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "eeeeeeee-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT lives_ok(
    $$ SELECT public.reveal_project_credential('44444444-5555-6666-7777-888888888888', 'eeeeeeee-0000-0000-0000-000000000000') $$,
    'Decryptor can use reveal RPC'
);

SELECT results_eq(
    $$ DELETE FROM public.project_credentials WHERE id = '44444444-5555-6666-7777-888888888888' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Secret reader cannot delete'
);

-- ============================================================================
-- TESTS: WRITER
-- ============================================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "bbbbbbbb-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT lives_ok(
    $$ UPDATE public.project_credentials SET description = 'edited by writer' WHERE id = '44444444-5555-6666-7777-888888888888' $$,
    'Writer can edit metadata'
);

SELECT throws_ok(
    $$ SELECT public.rotate_project_credential('44444444-5555-6666-7777-888888888888', 'new_vault://test', NOW(), 'bbbbbbbb-0000-0000-0000-000000000000') $$,
    'Unauthorized: credentials:rotate permission required',
    'Writer cannot rotate'
);

SELECT throws_ok(
    $$ INSERT INTO public.project_credential_permissions (credential_id, role_id, permission_type) VALUES ('44444444-5555-6666-7777-888888888888', '33333333-0000-0000-0000-000000000001', 'REVEAL_SECRET') $$,
    'new row violates row-level security policy for table "project_credential_permissions"',
    'Writer cannot grant themselves read_secret (escalation)'
);

-- Child injection regression
SELECT throws_ok(
    $$ SELECT public.create_project_credential('22222222-3333-4444-5555-666666666667', 'Test', 'u', 'd', ARRAY['t'], 'e', 'c', 'p', 's', NOW(), 'bbbbbbbb-0000-0000-0000-000000000000') $$,
    'Unauthorized: credentials:write permission required',
    'Writer cannot create credential in foreign project'
);

-- ============================================================================
-- TESTS: ROTATOR
-- ============================================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "cccccccc-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT lives_ok(
    $$ SELECT public.rotate_project_credential('44444444-5555-6666-7777-888888888888', 'new_vault://test', NOW(), 'cccccccc-0000-0000-0000-000000000000') $$,
    'Rotator can use rotate RPC'
);

SELECT results_eq(
    $$ UPDATE public.project_credentials SET description = 'edited by rotator' WHERE id = '44444444-5555-6666-7777-888888888888' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Rotator cannot edit metadata directly'
);

-- ============================================================================
-- TESTS: DELETER
-- ============================================================================
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "dddddddd-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM public.project_credentials WHERE id = '44444444-5555-6666-7777-888888888888' $$,
    $$ VALUES (1::int) $$,
    'Deleter can see the credential before deleting'
);

SELECT results_eq(
    $$ DELETE FROM public.project_credentials WHERE id = '44444444-5555-6666-7777-888888888888' RETURNING id $$,
    $$ VALUES ('44444444-5555-6666-7777-888888888888'::uuid) $$,
    'Deleter can delete credential'
);

-- ============================================================================
-- TESTS: GRACEFUL DEGRADATION
-- ============================================================================
-- Now the credential is deleted!
SELECT is(
    public.credential_visible('44444444-5555-6666-7777-888888888888'),
    false,
    'credential_visible gracefully returns false for deleted credential'
);

SELECT is(
    public.credential_secret_visible('44444444-5555-6666-7777-888888888888'),
    false,
    'credential_secret_visible gracefully returns false for deleted credential'
);

-- ============================================================================
-- TESTS: AUDIT
-- ============================================================================
-- As an auditor
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "ffffffff-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT throws_ok(
    $$ SELECT public.reveal_project_credential('44444444-5555-6666-7777-888888888888', 'ffffffff-0000-0000-0000-000000000000') $$,
    'Unauthorized: credentials:decrypt permission required',
    'Audit/System admin cannot decrypt by default if lacking decrypt permission (even if they have audit)'
);

-- Create a new credential for audit test
SET ROLE postgres;
INSERT INTO public.project_credentials (id, project_id, name, category, provider) VALUES
  ('55555555-6666-7777-8888-999999999999', '22222222-3333-4444-5555-666666666666', 'Test Cred 2', 'Infrastructure', 'LOCAL')
ON CONFLICT DO NOTHING;

INSERT INTO public.project_credential_secrets (credential_id, secret_reference) VALUES
  ('55555555-6666-7777-8888-999999999999', 'vault://test2')
ON CONFLICT DO NOTHING;

-- Use postgres to insert an audit log directly since we can't trigger it via reveal easily without grant
SET ROLE postgres;
INSERT INTO public.project_credential_audit_logs (credential_id, actor_id, action) VALUES ('55555555-6666-7777-8888-999999999999', 'ffffffff-0000-0000-0000-000000000000', 'VIEWED');
SET ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "ffffffff-0000-0000-0000-000000000000", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM public.project_credential_audit_logs WHERE action = 'VIEWED' $$,
    $$ VALUES (1::int) $$,
    'Audit viewer can see audit logs'
);

SELECT * FROM finish();
ROLLBACK;
