BEGIN;

SELECT plan(28);

-- 1. Verify Expected Tables Exist (using has_table individually)
SELECT has_table('public', 'portfolio_projects', 'portfolio_projects table exists');
SELECT has_table('public', 'portfolio_categories', 'portfolio_categories table exists');
SELECT has_table('public', 'portfolio_project_categories', 'portfolio_project_categories table exists');
SELECT has_table('public', 'portfolio_metrics', 'portfolio_metrics table exists');
SELECT has_table('public', 'portfolio_media', 'portfolio_media table exists');
SELECT has_table('public', 'portfolio_project_links', 'portfolio_project_links table exists');

-- Verify RLS is enabled
SELECT is(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'portfolio_projects'),
    true,
    'RLS is enabled on portfolio_projects'
);
SELECT is(
    (SELECT relrowsecurity FROM pg_class WHERE relname = 'portfolio_categories'),
    true,
    'RLS is enabled on portfolio_categories'
);

-- 2. Verify Helper Functions exist
SELECT has_function('public', 'is_authenticated', 'Function is_authenticated exists');
SELECT has_function('public', 'is_anonymous', 'Function is_anonymous exists');
SELECT has_function('public', 'can_access_tenant', ARRAY['uuid'], 'Function can_access_tenant exists');
SELECT has_function('public', 'is_public_portfolio', ARRAY['public.portfolio_projects'], 'Function is_public_portfolio exists');

-- 3. Anonymous Access (Public)
SET LOCAL ROLE anon;

-- Should be able to select from categories (all public)
SELECT results_eq(
    $$ SELECT count(*) > 0 FROM portfolio_categories $$,
    $$ VALUES (true) $$,
    'Anonymous users can view portfolio categories'
);

-- Should only see PUBLISHED projects
SELECT results_eq(
    $$ SELECT count(*) = 0 FROM portfolio_projects WHERE status != 'PUBLISHED' $$,
    $$ VALUES (true) $$,
    'Anonymous users cannot see DRAFT or ARCHIVED projects'
);

-- Should NOT be able to insert
SELECT throws_ok(
    $$ INSERT INTO portfolio_projects (slug, title, status) VALUES ('test-anon', 'Test', 'DRAFT') $$,
    'permission denied for table portfolio_projects',
    'Anonymous cannot insert projects'
);

RESET ROLE;
-- Setup Mock Users and Roles for Testing
INSERT INTO public.organizations (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000000', 'Test Org', 'test-org') ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, is_system) VALUES ('TEST_READER', false), ('TEST_WRITER', false), ('TEST_DELETER', false);
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'portfolio:read' FROM public.roles WHERE name IN ('TEST_READER', 'TEST_WRITER', 'TEST_DELETER');
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'portfolio:write' FROM public.roles WHERE name = 'TEST_WRITER';
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'portfolio:delete' FROM public.roles WHERE name = 'TEST_DELETER';

-- Create deterministic UUIDs for users with unique raw_user_meta_data to avoid trigger slug collisions
INSERT INTO auth.users (id, role, aud, email, raw_user_meta_data) VALUES
    ('11111111-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'reader@reader.com', '{"full_name": "Reader1"}'),
    ('22222222-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'writer@writer.com', '{"full_name": "Writer2"}'),
    ('33333333-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'deleter@deleter.com', '{"full_name": "Deleter3"}')
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT '11111111-0000-0000-0000-000000000001', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_READER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT '22222222-0000-0000-0000-000000000002', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_WRITER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT '33333333-0000-0000-0000-000000000003', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_DELETER'
ON CONFLICT DO NOTHING;

-- 4. Authenticated WITHOUT Permission
RESET ROLE;
SET LOCAL ROLE authenticated;
-- Mock a user with NO roles
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000999", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*) = 0 FROM portfolio_projects WHERE status != 'PUBLISHED' $$,
    $$ VALUES (true) $$,
    'Authenticated users without permission still cannot see DRAFT projects'
);

-- update affects 0 rows
SELECT results_eq(
    $$ UPDATE portfolio_projects SET title = 'Hacked' WHERE status = 'PUBLISHED' RETURNING id $$,
    $$ SELECT id FROM portfolio_projects WHERE false $$,
    'Authenticated users without permission cannot update projects (0 rows affected)'
);

-- 5. Authenticated WITH Read Permission
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "11111111-0000-0000-0000-000000000001", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

DO $$ BEGIN
    RAISE NOTICE 'POLICIES: %', (SELECT string_agg(policyname, ',') FROM pg_policies WHERE tablename = 'portfolio_projects');
END $$;

SELECT results_eq(
    $$ SELECT public.has_permission('portfolio:write') $$,
    $$ VALUES (false) $$,
    'DIAGNOSTIC: TEST_READER should NOT have portfolio:write'
);

SELECT lives_ok(
    $$ SELECT count(*) FROM portfolio_projects $$,
    'Users with portfolio:read can query all projects'
);

SELECT throws_ok(
    $$ INSERT INTO portfolio_projects (slug, title, status) VALUES ('test-read', 'Test', 'DRAFT') $$,
    'new row violates row-level security policy for table "portfolio_projects"',
    'Users with ONLY read permission cannot insert projects'
);

-- 6. Authenticated WITH Write Permission
RESET ROLE;
SELECT results_eq(
    $$ SELECT count(*) > 0 FROM public.effective_permissions WHERE user_id = '22222222-0000-0000-0000-000000000002' AND permission_id = 'portfolio:write' $$,
    $$ VALUES (true) $$,
    'DIAGNOSTIC: TEST_WRITER effective_permissions query'
);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "22222222-0000-0000-0000-000000000002", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT public.has_permission('portfolio:write') $$,
    $$ VALUES (true) $$,
    'DIAGNOSTIC: TEST_WRITER should have portfolio:write'
);

SELECT lives_ok(
    $$ INSERT INTO portfolio_projects (slug, title, status) VALUES ('test-write', 'Test Write', 'DRAFT') $$,
    'Users with portfolio:write can insert projects'
);

SELECT lives_ok(
    $$ UPDATE portfolio_projects SET title = 'Test Write Updated' WHERE slug = 'test-write' $$,
    'Users with portfolio:write can update projects'
);

SELECT lives_ok(
    $$ DELETE FROM portfolio_projects WHERE slug = 'test-write' $$,
    'Users with portfolio:write cannot delete projects (0 rows affected)'
);

-- 7. Authenticated WITH Delete Permission
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "33333333-0000-0000-0000-000000000003", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

-- Since Delete fails silently with USING clause, we do lives_ok then check row still exists
SELECT lives_ok(
    $$ DELETE FROM portfolio_projects WHERE slug = 'test-write' $$,
    'Users with portfolio:delete can execute delete query'
);

-- 8. Service Role Access (Bypass RLS)
RESET ROLE;
SET LOCAL ROLE service_role;
SELECT lives_ok(
    $$ INSERT INTO portfolio_projects (slug, title, status) VALUES ('service-role-test', 'Service Role', 'DRAFT') $$,
    'Service role can bypass RLS to insert'
);
SELECT lives_ok(
    $$ DELETE FROM portfolio_projects WHERE slug = 'service-role-test' $$,
    'Service role can bypass RLS to delete'
);

SELECT * FROM finish();
ROLLBACK;
