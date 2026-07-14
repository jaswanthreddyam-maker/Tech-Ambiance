BEGIN;
SELECT plan(27);

-- 1. Verify Function Definitions
SELECT has_function('public', 'current_organization_id', 'current_organization_id should exist');
SELECT function_privs_are('public', 'current_organization_id', ARRAY[]::text[], 'authenticated', ARRAY['EXECUTE'], 'authenticated should have execute on current_organization_id');
SELECT function_privs_are('public', 'current_organization_id', ARRAY[]::text[], 'anon', ARRAY[]::text[], 'anon should not have execute on current_organization_id');

SELECT has_function('public', 'current_roles', 'current_roles should exist');
SELECT function_privs_are('public', 'current_roles', ARRAY[]::text[], 'authenticated', ARRAY['EXECUTE'], 'authenticated should have execute on current_roles');

SELECT has_function('public', 'has_permission', ARRAY['text'], 'has_permission should exist');
SELECT function_privs_are('public', 'has_permission', ARRAY['text'], 'authenticated', ARRAY['EXECUTE'], 'authenticated should have execute on has_permission');

SELECT has_function('public', 'audit_authorization_decision', ARRAY['text', 'text', 'text', 'text', 'text', 'text'], 'audit should exist');

SELECT has_function('public', 'is_system_role', ARRAY['text'], 'is_system_role should exist');


-- 2. Test current_organization_id()
SELECT set_config('request.jwt.claims', '{"app_metadata": {"organization_id": "11111111-1111-1111-1111-111111111111"}}', true);
SELECT results_eq(
    $$ SELECT public.current_organization_id() $$,
    $$ VALUES ('11111111-1111-1111-1111-111111111111'::uuid) $$,
    'current_organization_id() should return valid uuid from JWT'
);

SELECT set_config('request.jwt.claims', '', true);
SELECT results_eq(
    $$ SELECT public.current_organization_id() $$,
    $$ VALUES (NULL::uuid) $$,
    'current_organization_id() should return NULL if unauthenticated'
);

SELECT set_config('request.jwt.claims', 'invalid_json', true);
SELECT results_eq(
    $$ SELECT public.current_organization_id() $$,
    $$ VALUES (NULL::uuid) $$,
    'current_organization_id() should gracefully handle malformed JWT'
);


-- 3. Test current_roles()
SELECT set_config('request.jwt.claims', '{"app_metadata": {"roles": ["ADMIN"]}}', true);
SELECT results_eq(
    $$ SELECT public.current_roles() $$,
    $$ VALUES (ARRAY['ADMIN']::text[]) $$,
    'current_roles() should return single role'
);

SELECT set_config('request.jwt.claims', '{"app_metadata": {"roles": ["ADMIN", "EDITOR"]}}', true);
SELECT results_eq(
    $$ SELECT public.current_roles() $$,
    $$ VALUES (ARRAY['ADMIN', 'EDITOR']::text[]) $$,
    'current_roles() should return multiple roles'
);

SELECT set_config('request.jwt.claims', '{"app_metadata": {}}', true);
SELECT results_eq(
    $$ SELECT public.current_roles() $$,
    $$ VALUES ('{}'::text[]) $$,
    'current_roles() should return empty array if no roles'
);

SELECT set_config('request.jwt.claims', '{"app_metadata": {"roles": "not_an_array"}}', true);
SELECT results_eq(
    $$ SELECT public.current_roles() $$,
    $$ VALUES ('{}'::text[]) $$,
    'current_roles() should gracefully handle malformed roles'
);


-- 4. Test has_permission() Correctness
DO $$ 
DECLARE
    v_uid uuid := '22222222-2222-2222-2222-222222222222'::uuid;
    v_org_1 uuid := '11111111-1111-1111-1111-111111111111'::uuid;
    v_org_2 uuid := '33333333-3333-3333-3333-333333333333'::uuid;
    v_role_1 uuid := gen_random_uuid();
    v_role_2 uuid := gen_random_uuid();
BEGIN
    SET session_replication_role = replica;

    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_1, 'Org 1', 'org-1'), (v_org_2, 'Org 2', 'org-2');
    INSERT INTO public.roles (id, organization_id, name) VALUES (v_role_1, v_org_1, 'Admin'), (v_role_2, v_org_1, 'Editor');
    INSERT INTO public.permissions (id, module, name) VALUES ('read', 'test', 'Read'), ('write', 'test', 'Write');
    
    -- Admin has read/write
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (v_role_1, 'read'), (v_role_1, 'write');
    -- Editor has read (creating duplicate permission possibility for users with both)
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (v_role_2, 'read');

    -- Assign user both roles in Org 1
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES (v_uid, v_role_1, v_org_1);
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES (v_uid, v_role_2, v_org_1);

    SET session_replication_role = DEFAULT;
END $$;

-- Set up claims for User in Org 1
SELECT set_config('request.jwt.claims', '{"sub": "22222222-2222-2222-2222-222222222222", "app_metadata": {"organization_id": "11111111-1111-1111-1111-111111111111"}}', true);

SELECT results_eq($$ SELECT public.has_permission('read') $$, $$ VALUES (true) $$, 'has_permission: permission exists (duplicate assignment properly handled)');
SELECT results_eq($$ SELECT public.has_permission('write') $$, $$ VALUES (true) $$, 'has_permission: permission exists via single role');
SELECT results_eq($$ SELECT public.has_permission('delete') $$, $$ VALUES (false) $$, 'has_permission: nonexistent permission');
SELECT results_eq($$ SELECT public.has_permission('absent') $$, $$ VALUES (false) $$, 'has_permission: permission absent');

-- Wrong organization
SELECT set_config('request.jwt.claims', '{"sub": "22222222-2222-2222-2222-222222222222", "app_metadata": {"organization_id": "33333333-3333-3333-3333-333333333333"}}', true);
SELECT results_eq($$ SELECT public.has_permission('read') $$, $$ VALUES (false) $$, 'has_permission: wrong organization should return false');

-- Unauthenticated
SELECT set_config('request.jwt.claims', '', true);
SELECT results_eq($$ SELECT public.has_permission('read') $$, $$ VALUES (false) $$, 'has_permission: unauthenticated should return false');


-- 5. Performance / Stress test simulation
-- 10 roles, 250 permissions, 5,000 mappings
DO $$
DECLARE
    v_uid uuid := '44444444-4444-4444-4444-444444444444'::uuid;
    v_org_id uuid := '55555555-5555-5555-5555-555555555555'::uuid;
    v_roles uuid[] := ARRAY(SELECT gen_random_uuid() FROM generate_series(1, 10));
    v_perms text[] := ARRAY(SELECT 'perm_' || i FROM generate_series(1, 250) AS g(i));
    i int;
    j int;
BEGIN
    SET session_replication_role = replica;

    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_id, 'Stress Org', 'stress-org');

    -- Insert roles
    FOR i IN 1..10 LOOP
        INSERT INTO public.roles (id, organization_id, name) VALUES (v_roles[i], v_org_id, 'Role ' || i);
        -- Assign user to all 10 roles
        INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES (v_uid, v_roles[i], v_org_id);
    END LOOP;

    -- Insert permissions
    FOR i IN 1..250 LOOP
        INSERT INTO public.permissions (id, module, name) VALUES (v_perms[i], 'stress', 'Perm ' || i);
    END LOOP;

    -- Insert mappings (10 roles * 250 perms = 2500)
    -- We can also duplicate via permission groups to get to 5000 mappings.
    FOR i IN 1..10 LOOP
        FOR j IN 1..250 LOOP
            INSERT INTO public.role_permissions (role_id, permission_id) VALUES (v_roles[i], v_perms[j]);
        END LOOP;
    END LOOP;

    SET session_replication_role = DEFAULT;
END $$;

SELECT set_config('request.jwt.claims', '{"sub": "44444444-4444-4444-4444-444444444444", "app_metadata": {"organization_id": "55555555-5555-5555-5555-555555555555"}}', true);
SELECT results_eq($$ SELECT public.has_permission('perm_1') $$, $$ VALUES (true) $$, 'has_permission: evaluates correctly under scale (2500 mappings)');
SELECT results_eq($$ SELECT public.has_permission('perm_999') $$, $$ VALUES (false) $$, 'has_permission: evaluates false correctly under scale');


-- 6. Audit Logging
SELECT set_config('request.jwt.claims', '{"sub": "44444444-4444-4444-4444-444444444444", "app_metadata": {"organization_id": "55555555-5555-5555-5555-555555555555"}}', true);
SELECT public.audit_authorization_decision('perm_1', 'invoice', 'inv_123', 'GRANTED', 'test', 'Test passed');
SELECT results_eq(
    $$ SELECT permission_id, decision FROM public.authorization_audit WHERE resource_id = 'inv_123' $$,
    $$ VALUES ('perm_1'::text, 'GRANTED'::text) $$,
    'audit_authorization_decision should insert record'
);

-- 7. Test is_system_role
DO $$
BEGIN
    SET session_replication_role = replica;
    INSERT INTO public.roles (id, organization_id, name, is_system) VALUES (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'SUPER_ADMIN', true);
    INSERT INTO public.roles (id, organization_id, name, is_system) VALUES (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', 'NORMAL_ROLE', false);
    SET session_replication_role = DEFAULT;
END $$;

SELECT results_eq($$ SELECT public.is_system_role('SUPER_ADMIN') $$, $$ VALUES (true) $$, 'is_system_role should return true for system roles');
SELECT results_eq($$ SELECT public.is_system_role('NORMAL_ROLE') $$, $$ VALUES (false) $$, 'is_system_role should return false for normal roles');

SELECT * FROM finish();
ROLLBACK;
