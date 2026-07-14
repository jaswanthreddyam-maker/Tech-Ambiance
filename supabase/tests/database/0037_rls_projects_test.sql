BEGIN;

SELECT plan(27);

-- 1. Verify Expected Tables Exist
SELECT has_table('public', 'projects', 'projects table exists');
SELECT has_table('public', 'milestones', 'milestones table exists');
SELECT has_table('public', 'deliverable_files', 'deliverable_files table exists');
SELECT has_table('public', 'timeline_events', 'timeline_events table exists');
SELECT has_table('public', 'client_journey_events', 'client_journey_events table exists');

-- 2. Verify RLS is Enabled
SELECT results_eq($$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects' $$, $$ VALUES (true) $$, 'RLS is enabled on projects');
SELECT results_eq($$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'milestones' $$, $$ VALUES (true) $$, 'RLS is enabled on milestones');
SELECT results_eq($$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deliverable_files' $$, $$ VALUES (true) $$, 'RLS is enabled on deliverable_files');
SELECT results_eq($$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'timeline_events' $$, $$ VALUES (true) $$, 'RLS is enabled on timeline_events');
SELECT results_eq($$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'client_journey_events' $$, $$ VALUES (true) $$, 'RLS is enabled on client_journey_events');

-- 3. Setup Mock Users and Roles for Testing
INSERT INTO public.organizations (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Test Org', 'test-org'),
  ('00000000-0000-0000-0000-000000000001', 'Foreign Org', 'foreign-org')
ON CONFLICT DO NOTHING;

INSERT INTO public.workspaces (id, organization_id, name, slug) VALUES 
  ('11111111-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Test Workspace', 'test-ws'),
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Foreign Workspace', 'foreign-ws')
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, is_system) VALUES 
  ('TEST_PROJECT_READER', false), 
  ('TEST_PROJECT_WRITER', false), 
  ('TEST_PROJECT_DELETER', false);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'project:read' FROM public.roles WHERE name IN ('TEST_PROJECT_READER', 'TEST_PROJECT_WRITER', 'TEST_PROJECT_DELETER');

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'project:write' FROM public.roles WHERE name IN ('TEST_PROJECT_WRITER', 'TEST_PROJECT_DELETER');

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'project:delete' FROM public.roles WHERE name = 'TEST_PROJECT_DELETER';

-- Create deterministic UUIDs for users with unique raw_user_meta_data to avoid trigger slug collisions
INSERT INTO auth.users (id, role, aud, email, raw_user_meta_data) VALUES
    ('dddddddd-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'reader_p@test.com', '{"full_name": "Project Reader"}'),
    ('eeeeeeee-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'writer_p@test.com', '{"full_name": "Project Writer"}'),
    ('ffffffff-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'deleter_p@test.com', '{"full_name": "Project Deleter"}')
ON CONFLICT DO NOTHING;

-- Disable auto-provision triggers for mock
ALTER TABLE public.user_roles DISABLE TRIGGER ensure_owner_exists;

DELETE FROM public.user_roles WHERE user_id IN (
    'dddddddd-0000-0000-0000-000000000001', 
    'eeeeeeee-0000-0000-0000-000000000002', 
    'ffffffff-0000-0000-0000-000000000003'
);

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'dddddddd-0000-0000-0000-000000000001', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_PROJECT_READER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'eeeeeeee-0000-0000-0000-000000000002', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_PROJECT_WRITER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'ffffffff-0000-0000-0000-000000000003', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_PROJECT_DELETER'
ON CONFLICT DO NOTHING;

ALTER TABLE public.user_roles ENABLE TRIGGER ensure_owner_exists;

-- Seed some test data
INSERT INTO public.projects (id, workspace_id, name, slug, status) VALUES
  ('22222222-3333-4444-5555-666666666666', '11111111-0000-0000-0000-000000000000', 'Test Project', 'test-project', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO public.projects (id, workspace_id, name, slug, status) VALUES
  ('22222222-3333-4444-5555-666666666667', '11111111-0000-0000-0000-000000000001', 'Foreign Project', 'foreign-project', 'Active')
ON CONFLICT DO NOTHING;

INSERT INTO public.milestones (id, project_id, title, target_date) VALUES
  ('33333333-4444-5555-6666-777777777777', '22222222-3333-4444-5555-666666666666', 'Test Milestone', '2026-12-31')
ON CONFLICT DO NOTHING;

INSERT INTO public.client_journey_events (id, organization_id, title, status, event_date) VALUES
  ('44444444-5555-6666-7777-888888888888', '00000000-0000-0000-0000-000000000000', 'Test Journey', 'pending', '2026-07-14')
ON CONFLICT DO NOTHING;

-- 4. Test Anonymous Access (Public)
SET LOCAL ROLE anon;
SELECT throws_ok(
    $$ SELECT count(*)::int FROM projects $$,
    'permission denied for table projects',
    'Anonymous users cannot view projects'
);

-- 5. Test Missing Permission
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000999", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM projects $$,
    $$ VALUES (0::int) $$,
    'Users without project:read cannot view projects'
);

-- 6. Test Correct Permission (Reader)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "dddddddd-0000-0000-0000-000000000001", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM projects WHERE id = '22222222-3333-4444-5555-666666666666' $$,
    $$ VALUES (1::int) $$,
    'Reader can view their projects'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM projects WHERE id = '22222222-3333-4444-5555-666666666667' $$,
    $$ VALUES (0::int) $$,
    'Reader cannot view foreign projects'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM milestones WHERE id = '33333333-4444-5555-6666-777777777777' $$,
    $$ VALUES (1::int) $$,
    'Reader can view their milestones'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM client_journey_events WHERE id = '44444444-5555-6666-7777-888888888888' $$,
    $$ VALUES (1::int) $$,
    'Reader can view their client journey events'
);

SELECT throws_ok(
    $$ INSERT INTO projects (workspace_id, name, slug, status) VALUES ('11111111-0000-0000-0000-000000000000', 'Hacked Project', 'hacked-project', 'Active') $$,
    'new row violates row-level security policy for table "projects"',
    'Reader cannot insert projects'
);
SELECT results_eq(
    $$ UPDATE projects SET name = 'Hacked' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Reader cannot update projects'
);
SELECT results_eq(
    $$ DELETE FROM projects RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Reader cannot delete projects'
);

-- 7. Test Correct Permission (Writer)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "eeeeeeee-0000-0000-0000-000000000002", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ UPDATE projects SET name = 'Updated Project' WHERE id = '22222222-3333-4444-5555-666666666666' RETURNING name::text $$,
    $$ VALUES ('Updated Project'::text) $$,
    'Writer can update projects'
);
SELECT results_eq(
    $$ UPDATE milestones SET title = 'Updated Milestone' WHERE id = '33333333-4444-5555-6666-777777777777' RETURNING title::text $$,
    $$ VALUES ('Updated Milestone'::text) $$,
    'Writer can update milestones'
);

-- REGRESSION 1: Project reassignment
SELECT throws_ok(
    $$ UPDATE projects SET workspace_id = '11111111-0000-0000-0000-000000000001' WHERE id = '22222222-3333-4444-5555-666666666666' $$,
    'new row violates row-level security policy for table "projects"',
    'Writer cannot reassign project to foreign workspace'
);

-- REGRESSION 2: Child resource injection
SELECT throws_ok(
    $$ INSERT INTO milestones (project_id, title, target_date) VALUES ('22222222-3333-4444-5555-666666666667', 'Hacked Milestone', '2026-12-31') $$,
    'new row violates row-level security policy for table "milestones"',
    'Writer cannot inject milestone into foreign project'
);

SELECT results_eq(
    $$ DELETE FROM projects RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Writer cannot delete projects'
);

-- 8. Test Correct Permission (Deleter)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "ffffffff-0000-0000-0000-000000000003", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ DELETE FROM client_journey_events WHERE id = '44444444-5555-6666-7777-888888888888' RETURNING id $$,
    $$ VALUES ('44444444-5555-6666-7777-888888888888'::uuid) $$,
    'Deleter can delete client journey events'
);
SELECT results_eq(
    $$ DELETE FROM milestones WHERE id = '33333333-4444-5555-6666-777777777777' RETURNING id $$,
    $$ VALUES ('33333333-4444-5555-6666-777777777777'::uuid) $$,
    'Deleter can delete milestones'
);
SELECT results_eq(
    $$ DELETE FROM projects WHERE id = '22222222-3333-4444-5555-666666666666' RETURNING id $$,
    $$ VALUES ('22222222-3333-4444-5555-666666666666'::uuid) $$,
    'Deleter can delete projects'
);

SELECT * FROM finish();
ROLLBACK;
