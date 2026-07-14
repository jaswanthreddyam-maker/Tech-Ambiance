-- ==============================================================================
-- PHASE C6: JWT Integration
-- ==============================================================================

-- 1. Helper Function: build_authorization_claims
CREATE OR REPLACE FUNCTION public.build_authorization_claims(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id uuid;
    v_roles text[];
    v_auth_version int;
BEGIN
    -- 1. Get active organization
    SELECT active_organization_id INTO v_org_id
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_org_id IS NULL THEN
        -- Organization missing -> Reject token (security issue)
        RAISE EXCEPTION 'Missing active organization for user %', p_user_id;
    END IF;

    -- 2. Get roles for this organization
    SELECT array_agg(DISTINCT r.name) INTO v_roles
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND (ur.organization_id = v_org_id OR ur.organization_id IS NULL);

    IF v_roles IS NULL THEN
        v_roles := ARRAY[]::text[];
    END IF;

    -- 3. Get authorization version
    SELECT permission_dictionary_version INTO v_auth_version
    FROM public.authorization_metadata
    WHERE organization_id = v_org_id;

    IF v_auth_version IS NULL THEN
        v_auth_version := 1;
    END IF;

    -- 4. Build JSON
    RETURN jsonb_build_object(
        'organization_id', v_org_id,
        'roles', v_roles,
        'authorization_version', v_auth_version
    );
EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE 'Missing active organization%' THEN
        RAISE;
    END IF;

    BEGIN
        INSERT INTO public.authorization_events (organization_id, actor_id, action, target_type, target_id, metadata)
        VALUES (v_org_id, p_user_id, 'JWT_BUILD_FAILED', 'system', 'jwt_hook', jsonb_build_object('error', SQLERRM, 'severity', 'ERROR'));
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN jsonb_build_object(
        'organization_id', v_org_id,
        'roles', ARRAY[]::text[],
        'authorization_version', 1
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.build_authorization_claims TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.build_authorization_claims TO authenticated;

-- 2. JWT Hook Function
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_claims jsonb;
    v_app_metadata jsonb;
BEGIN
    v_user_id := (event->'claims'->>'sub')::uuid;

    -- Fetch minimal identity claims
    v_claims := public.build_authorization_claims(v_user_id);

    -- Get existing app_metadata or create empty object
    v_app_metadata := COALESCE(event->'claims'->'app_metadata', '{}'::jsonb);

    -- Merge claims into app_metadata
    v_app_metadata := v_app_metadata || v_claims;

    -- Update event
    event := jsonb_set(event, '{claims, app_metadata}', v_app_metadata);

    RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
