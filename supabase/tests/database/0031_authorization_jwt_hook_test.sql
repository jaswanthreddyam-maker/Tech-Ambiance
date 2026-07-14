BEGIN;
SELECT plan(8);

-- Setup test data
DO $$
DECLARE    
    v_user_1 uuid := '66666666-6666-6666-6666-666666666661';
    v_user_2 uuid := '66666666-6666-6666-6666-666666666662';
    v_user_no_role uuid := '66666666-6666-6666-6666-666666666663';
    
    v_org_1 uuid;
    v_org_2 uuid;
    v_org_no_role uuid;
    
    v_owner_role_id uuid;
    v_admin_role_id uuid;
BEGIN
    -- Get system role ids
    SELECT id INTO v_owner_role_id FROM public.roles WHERE name = 'OWNER' AND is_system = true;
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'ADMIN' AND is_system = true;

    -- Create users (trigger auto-creates profiles and orgs and sets them as OWNER)
    INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES 
        (v_user_1, 'user1@test.com', '{"full_name": "User 1"}'), 
        (v_user_2, 'user2@test.com', '{"full_name": "User 2"}'), 
        (v_user_no_role, 'norole@test.com', '{"full_name": "No Role"}');
    
    SELECT active_organization_id INTO v_org_1 FROM public.profiles WHERE id = v_user_1;
    SELECT active_organization_id INTO v_org_2 FROM public.profiles WHERE id = v_user_2;
    SELECT active_organization_id INTO v_org_no_role FROM public.profiles WHERE id = v_user_no_role;

    -- Set auth metadata for org 1 with version = 7
    INSERT INTO public.authorization_metadata (organization_id, permission_dictionary_version)
    VALUES (v_org_1, 7);

    -- Assign roles
    -- User 1 already has OWNER in org_1. Give them ADMIN in Org 1 too.
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES
        (v_user_1, v_admin_role_id, v_org_1);
        
    -- User 1 gets OWNER in Org 2 (should not be in claims when active org is Org 1)
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES
        (v_user_1, v_owner_role_id, v_org_2);

    -- For user_no_role, we need them to have no roles. 
    -- To bypass the "Cannot remove last OWNER" constraint, we first make user_1 an OWNER of their org.
    INSERT INTO public.user_roles (user_id, role_id, organization_id) VALUES
        (v_user_1, v_owner_role_id, v_org_no_role);
    DELETE FROM public.user_roles WHERE user_id = v_user_no_role;

END $$;

-- 1. Multiple roles + Wrong organization
SELECT results_eq(
    $$ SELECT (public.build_authorization_claims('66666666-6666-6666-6666-666666666661')) -> 'roles' $$,
    $$ VALUES ('["ADMIN", "OWNER"]'::jsonb) $$,
    'Multiple roles: User 1 should have OWNER and ADMIN, but not duplicate OWNER from Org 2'
);

-- 2. Authorization version
SELECT results_eq(
    $$ SELECT (public.build_authorization_claims('66666666-6666-6666-6666-666666666661')) ->> 'authorization_version' $$,
    $$ VALUES ('7'::text) $$,
    'Authorization version should be 7 from metadata'
);

-- 3. Single role (Bootstrap OWNER)
SELECT results_eq(
    $$ SELECT (public.build_authorization_claims('66666666-6666-6666-6666-666666666662')) -> 'roles' $$,
    $$ VALUES ('["OWNER"]'::jsonb) $$,
    'Single role: User 2 should have exactly OWNER'
);

-- 4. No roles
SELECT results_eq(
    $$ SELECT (public.build_authorization_claims('66666666-6666-6666-6666-666666666663')) -> 'roles' $$,
    $$ VALUES ('[]'::jsonb) $$,
    'No roles: Should return empty JSON array'
);

-- 5. Revoked role
-- First delete ADMIN from user 1
DO $$ 
DECLARE 
    v_user_1 uuid := '66666666-6666-6666-6666-666666666661';
    v_admin_role_id uuid;
    v_org_1 uuid;
BEGIN
    SELECT active_organization_id INTO v_org_1 FROM public.profiles WHERE id = v_user_1;
    SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'ADMIN' AND is_system = true;
    DELETE FROM public.user_roles WHERE user_id = v_user_1 AND role_id = v_admin_role_id AND organization_id = v_org_1;
END $$;

SELECT results_eq(
    $$ SELECT (public.build_authorization_claims('66666666-6666-6666-6666-666666666661')) -> 'roles' $$,
    $$ VALUES ('["OWNER"]'::jsonb) $$,
    'Revoked role: User 1 should now only have OWNER'
);

-- 6. Missing organization rejection
DO $$
DECLARE
    v_user_no_org uuid := '66666666-6666-6666-6666-666666666664';
BEGIN
    INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES (v_user_no_org, 'noorg@test.com', '{"full_name": "No Org"}');
    UPDATE public.profiles SET active_organization_id = NULL WHERE id = v_user_no_org;
END $$;

SELECT throws_ok(
    $$ SELECT public.build_authorization_claims('66666666-6666-6666-6666-666666666664') $$,
    'Missing active organization for user 66666666-6666-6666-6666-666666666664',
    'Organization missing -> Reject token with exception'
);

-- 7. Missing metadata row -> Version = 1
SELECT results_eq(
    $$ SELECT (public.build_authorization_claims('66666666-6666-6666-6666-666666666662')) ->> 'authorization_version' $$,
    $$ VALUES ('1'::text) $$,
    'Missing metadata row: Should default authorization_version to 1'
);

-- 8. Test JWT Hook modifies token
DO $$
DECLARE
    v_user_2 uuid := '66666666-6666-6666-6666-666666666662';
    v_org_2 uuid;
    v_result jsonb;
BEGIN
    SELECT active_organization_id INTO v_org_2 FROM public.profiles WHERE id = v_user_2;
    
    v_result := public.custom_access_token_hook(
        '{"claims": {"sub": "66666666-6666-6666-6666-666666666662", "app_metadata": {"provider": "email"}}}'::jsonb
    );
    
    -- We expect the result to have roles=["OWNER"], provider="email", authorization_version=1, organization_id=v_org_2
    -- Instead of a hardcoded string, we'll verify the subkeys
    IF v_result->'claims'->'app_metadata'->'provider' != '"email"'::jsonb THEN
        RAISE EXCEPTION 'Provider was destroyed';
    END IF;
    IF v_result->'claims'->'app_metadata'->'roles' != '["OWNER"]'::jsonb THEN
        RAISE EXCEPTION 'Roles not injected';
    END IF;
    IF v_result->'claims'->'app_metadata'->>'organization_id' != v_org_2::text THEN
        RAISE EXCEPTION 'Organization ID not injected';
    END IF;
    IF v_result->'claims'->'app_metadata'->'authorization_version' != '1'::jsonb THEN
        RAISE EXCEPTION 'Authorization version not injected';
    END IF;
END $$;

SELECT pass('JWT Hook should correctly inject claims into app_metadata without destroying existing properties');

SELECT * FROM finish();
ROLLBACK;
