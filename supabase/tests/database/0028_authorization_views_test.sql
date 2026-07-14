BEGIN;
SELECT plan(13);

-- 1. Check Views Exist
SELECT has_view('public', 'effective_permissions', 'effective_permissions view should exist');
SELECT has_view('public', 'effective_role_assignments', 'effective_role_assignments view should exist');

-- 2. Check Columns Exist
SELECT has_column('public', 'effective_permissions', 'user_id', 'effective_permissions should have user_id');
SELECT has_column('public', 'effective_permissions', 'organization_id', 'effective_permissions should have organization_id');
SELECT has_column('public', 'effective_permissions', 'permission_id', 'effective_permissions should have permission_id');
SELECT has_column('public', 'effective_permissions', 'role_name', 'effective_permissions should have role_name');

SELECT has_column('public', 'effective_role_assignments', 'user_id', 'effective_role_assignments should have user_id');
SELECT has_column('public', 'effective_role_assignments', 'organization_id', 'effective_role_assignments should have organization_id');
SELECT has_column('public', 'effective_role_assignments', 'role_id', 'effective_role_assignments should have role_id');
SELECT has_column('public', 'effective_role_assignments', 'role_name', 'effective_role_assignments should have role_name');

-- 3. Test Data Resolution & Isolation
-- Setup test data
DO $$ 
DECLARE
    v_user_1 uuid := gen_random_uuid();
    v_user_2 uuid := gen_random_uuid();
    v_org_1 uuid := gen_random_uuid();
    v_org_2 uuid := gen_random_uuid();
    v_role_1 uuid := gen_random_uuid();
    v_role_2 uuid := gen_random_uuid();
BEGIN
    -- Disable triggers temporarily to avoid auto-owner assignment
    SET session_replication_role = replica;

    -- Insert dummy users into auth.users to satisfy FK
    INSERT INTO auth.users (id, email) VALUES (v_user_1, 'test1@example.com'), (v_user_2, 'test2@example.com');

    -- Insert dummy orgs
    INSERT INTO public.organizations (id, name, slug) VALUES (v_org_1, 'Org 1', 'org-1'), (v_org_2, 'Org 2', 'org-2');

    -- Insert dummy roles
    INSERT INTO public.roles (id, organization_id, name) VALUES (v_role_1, v_org_1, 'Admin'), (v_role_2, v_org_2, 'Editor');

    -- Insert dummy permissions
    INSERT INTO public.permissions (id, module, name) VALUES ('test:read', 'test', 'Test Read'), ('test:write', 'test', 'Test Write');

    -- Map roles to permissions
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (v_role_1, 'test:read'), (v_role_1, 'test:write');
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES (v_role_2, 'test:read');

    -- Map users to roles
    -- User 1 is Admin in Org 1
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES (v_user_1, v_role_1, v_org_1);
    -- User 2 is Editor in Org 2
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES (v_user_2, v_role_2, v_org_2);

    -- Also give User 1 Editor in Org 2 to test multiple role union
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES (v_user_1, v_role_2, v_org_2);

    SET session_replication_role = DEFAULT;
END $$;

-- Assertions
-- User 1 should have test:write in Org 1 but NOT in Org 2
SELECT bag_eq(
    $$ SELECT permission_id FROM public.effective_permissions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test1@example.com') AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Org 1') $$,
    $$ VALUES ('test:read'), ('test:write') $$,
    'User 1 should have both read and write in Org 1'
);

SELECT bag_eq(
    $$ SELECT permission_id FROM public.effective_permissions WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test1@example.com') AND organization_id = (SELECT id FROM public.organizations WHERE name = 'Org 2') $$,
    $$ VALUES ('test:read') $$,
    'User 1 should only have read in Org 2 (Org isolation works)'
);

SELECT bag_eq(
    $$ SELECT role_name FROM public.effective_role_assignments WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test2@example.com') $$,
    $$ VALUES ('Editor') $$,
    'User 2 should correctly resolve to Editor role'
);

SELECT * FROM finish();
ROLLBACK;
