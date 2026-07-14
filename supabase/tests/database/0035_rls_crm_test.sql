BEGIN;

SELECT plan(20);

-- 1. Verify Expected Tables Exist
SELECT has_table('public', 'lead_consultations', 'lead_consultations table exists');
SELECT has_table('public', 'lead_events', 'lead_events table exists');
SELECT has_table('public', 'crm_pipeline_stages', 'crm_pipeline_stages table exists');
SELECT has_table('public', 'crm_stage_history', 'crm_stage_history table exists');

-- 2. Verify RLS is Enabled
SELECT results_eq(
    $$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lead_consultations' $$,
    $$ VALUES (true) $$,
    'RLS is enabled on lead_consultations'
);
SELECT results_eq(
    $$ SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'crm_pipeline_stages' $$,
    $$ VALUES (true) $$,
    'RLS is enabled on crm_pipeline_stages'
);

-- 3. Setup Mock Users and Roles for Testing
INSERT INTO public.organizations (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Test Org', 'test-org')
ON CONFLICT DO NOTHING;

INSERT INTO public.roles (name, is_system) VALUES 
  ('TEST_CRM_READER', false), 
  ('TEST_CRM_WRITER', false), 
  ('TEST_CRM_DELETER', false),
  ('TEST_SYSTEM_ADMIN', false);

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'crm:read' FROM public.roles WHERE name IN ('TEST_CRM_READER', 'TEST_CRM_WRITER', 'TEST_CRM_DELETER', 'TEST_SYSTEM_ADMIN');

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'crm:write' FROM public.roles WHERE name IN ('TEST_CRM_WRITER', 'TEST_CRM_DELETER');

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'crm:delete' FROM public.roles WHERE name = 'TEST_CRM_DELETER';

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT id, 'system:read' FROM public.roles WHERE name = 'TEST_SYSTEM_ADMIN';

-- Create deterministic UUIDs for users with unique raw_user_meta_data to avoid trigger slug collisions
INSERT INTO auth.users (id, role, aud, email, raw_user_meta_data) VALUES
    ('dddddddd-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'reader_c@test.com', '{"full_name": "CRM Reader"}'),
    ('eeeeeeee-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'writer_c@test.com', '{"full_name": "CRM Writer"}'),
    ('ffffffff-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'deleter_c@test.com', '{"full_name": "CRM Deleter"}'),
    ('aaaaaaaa-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin_c@test.com', '{"full_name": "System Admin"}')
ON CONFLICT DO NOTHING;

-- The trigger on_auth_user_created might provision them an OWNER role. 
-- We disable triggers to bypass "Cannot remove the last OWNER" constraint for test cleanup.
ALTER TABLE public.user_roles DISABLE TRIGGER ensure_owner_exists;

DELETE FROM public.user_roles WHERE user_id IN (
    'dddddddd-0000-0000-0000-000000000001', 
    'eeeeeeee-0000-0000-0000-000000000002', 
    'ffffffff-0000-0000-0000-000000000003', 
    'aaaaaaaa-1111-1111-1111-111111111111'
);

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'dddddddd-0000-0000-0000-000000000001', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_CRM_READER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'eeeeeeee-0000-0000-0000-000000000002', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_CRM_WRITER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'ffffffff-0000-0000-0000-000000000003', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_CRM_DELETER'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id, organization_id)
SELECT 'aaaaaaaa-1111-1111-1111-111111111111', id, '00000000-0000-0000-0000-000000000000' FROM public.roles WHERE name = 'TEST_SYSTEM_ADMIN'
ON CONFLICT DO NOTHING;

ALTER TABLE public.user_roles ENABLE TRIGGER ensure_owner_exists;

-- Seed some test data (bypass RLS as postgres user)
INSERT INTO public.lead_consultations (id, business_name, contact_email, industry, goals, budget_range, timeline, contact_name, contact_phone, preferred_contact) VALUES
  ('11111111-2222-3333-4444-555555555555', 'Test Lead', 'test@lead.com', 'Tech', '{"Grow"}', '$10k', 'ASAP', 'John', '555-0100', 'Email')
ON CONFLICT DO NOTHING;
INSERT INTO public.crm_pipeline_stages (id, name, color, sort_order) VALUES
  ('22222222-3333-4444-5555-666666666666', 'Test Stage', '#ffffff', 0)
ON CONFLICT DO NOTHING;


-- 4. Test Anonymous Access (Public)
SET LOCAL ROLE anon;

SELECT throws_ok(
    $$ SELECT count(*)::int FROM lead_consultations $$,
    'permission denied for table lead_consultations',
    'Anonymous users cannot view leads'
);
SELECT throws_ok(
    $$ SELECT count(*)::int FROM crm_pipeline_stages $$,
    'permission denied for table crm_pipeline_stages',
    'Anonymous users cannot view CRM stages'
);

-- 5. Test Missing Permission
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-0000-0000-000000000999", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int FROM lead_consultations $$,
    $$ VALUES (0) $$,
    'Missing Permission: Authenticated user without crm:read cannot see leads'
);
SELECT results_eq(
    $$ SELECT count(*)::int FROM crm_pipeline_stages $$,
    $$ VALUES (0) $$,
    'Missing Permission: Authenticated user without crm:read cannot see stages'
);

-- 6. Test Reader Permissions
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "dddddddd-0000-0000-0000-000000000001", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ SELECT count(*)::int > 0 FROM lead_consultations $$,
    $$ VALUES (true) $$,
    'Reader can see leads'
);
SELECT results_eq(
    $$ SELECT count(*)::int > 0 FROM crm_pipeline_stages $$,
    $$ VALUES (true) $$,
    'Reader can see stages'
);

-- Reader cannot write leads
SELECT throws_ok(
    $$ INSERT INTO lead_consultations (business_name, contact_email, industry, goals, budget_range, timeline, contact_name, contact_phone, preferred_contact) VALUES ('Hacked Lead', 'hacked@lead.com', 'Tech', '{"Grow"}', '$10k', 'ASAP', 'John', '555-0100', 'Email') $$,
    'new row violates row-level security policy for table "lead_consultations"',
    'Reader cannot insert leads'
);
SELECT results_eq(
    $$ UPDATE lead_consultations SET business_name = 'Hacked' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Reader cannot update leads'
);
SELECT results_eq(
    $$ DELETE FROM lead_consultations RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'Reader cannot delete leads'
);


-- 7. Test Writer Permissions
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "eeeeeeee-0000-0000-0000-000000000002", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ UPDATE lead_consultations SET business_name = 'Updated Lead' WHERE id = '11111111-2222-3333-4444-555555555555' RETURNING business_name::text $$,
    $$ VALUES ('Updated Lead'::text) $$,
    'Writer can update leads'
);

-- Writer cannot update stages (requires system:read)
SELECT results_eq(
    $$ UPDATE crm_pipeline_stages SET name = 'Hacked Stage' RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'CRM Writer cannot update stages (requires system:read)'
);
-- Writer cannot delete leads
SELECT results_eq(
    $$ DELETE FROM lead_consultations RETURNING id $$,
    $$ VALUES (NULL::uuid) LIMIT 0 $$,
    'CRM Writer cannot delete leads'
);

-- 8. Test Deleter Permissions
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "ffffffff-0000-0000-0000-000000000003", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ DELETE FROM lead_consultations WHERE id = '11111111-2222-3333-4444-555555555555' RETURNING id $$,
    $$ VALUES ('11111111-2222-3333-4444-555555555555'::uuid) $$,
    'CRM Deleter can delete leads'
);

-- 9. Test System Admin Permissions (for stages)
RESET ROLE;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "aaaaaaaa-1111-1111-1111-111111111111", "app_metadata": {"organization_id": "00000000-0000-0000-0000-000000000000"}}', true);

SELECT results_eq(
    $$ UPDATE crm_pipeline_stages SET name = 'Updated Stage' WHERE id = '22222222-3333-4444-5555-666666666666' RETURNING name::text $$,
    $$ VALUES ('Updated Stage'::text) $$,
    'System Admin can update stages'
);

SELECT * FROM finish();
ROLLBACK;
