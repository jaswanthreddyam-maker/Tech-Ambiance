-- ==============================================================================
-- PHASE C4: Authorization Functions
-- ==============================================================================
-- Description: Core authorization functions with strict security definer.
-- Idempotency: Uses CREATE OR REPLACE FUNCTION.
-- ==============================================================================

-- 1. Helper: current_organization_id()
-- Centralizes JWT parsing for tenant isolation.
CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN (nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'organization_id')::uuid;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

ALTER FUNCTION public.current_organization_id() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.current_organization_id() FROM public;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;


-- 2. Helper: current_roles()
-- Centralizes JWT parsing for assigned roles. Never returns NULL.
CREATE OR REPLACE FUNCTION public.current_roles()
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_roles jsonb;
    v_result text[];
BEGIN
    v_roles := (nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' -> 'roles');
    
    IF v_roles IS NULL OR jsonb_typeof(v_roles) != 'array' THEN
        RETURN '{}'::text[];
    END IF;

    SELECT array_agg(value::text) INTO v_result
    FROM jsonb_array_elements_text(v_roles);

    RETURN COALESCE(v_result, '{}'::text[]);
EXCEPTION WHEN OTHERS THEN
    RETURN '{}'::text[];
END;
$$;

ALTER FUNCTION public.current_roles() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.current_roles() FROM public;
GRANT EXECUTE ON FUNCTION public.current_roles() TO authenticated;


-- 3. Core: has_permission()
-- Thin facade over the effective_permissions view.
CREATE OR REPLACE FUNCTION public.has_permission(p_permission_id text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_org_id uuid := public.current_organization_id();
BEGIN
    -- Fast path rejection
    IF v_uid IS NULL THEN
        RETURN false;
    END IF;

    -- Query the pre-computed view (resolves direct + group roles)
    RETURN EXISTS (
        SELECT 1
        FROM public.effective_permissions ep
        WHERE ep.user_id = v_uid
          AND ep.permission_id = p_permission_id
          AND ep.organization_id = v_org_id
    );
END;
$$;

ALTER FUNCTION public.has_permission(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.has_permission(text) FROM public;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO authenticated;


-- 4. Audit: audit_authorization_decision()
-- Lightweight audit logger. Sync for now, can be swapped for async/pg_notify.
CREATE OR REPLACE FUNCTION public.audit_authorization_decision(
    p_permission_id text,
    p_resource_type text,
    p_resource_id text,
    p_decision text,
    p_decision_source text,
    p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO public.authorization_audit (
        user_id,
        organization_id,
        permission_id,
        resource_type,
        resource_id,
        decision,
        decision_source,
        reason
    ) VALUES (
        auth.uid(),
        public.current_organization_id(),
        p_permission_id,
        p_resource_type,
        p_resource_id,
        p_decision,
        p_decision_source,
        p_reason
    );
EXCEPTION WHEN OTHERS THEN
    -- Never fail authorization due to audit logging failure
    RAISE WARNING 'Audit log failed: %', SQLERRM;
END;
$$;

ALTER FUNCTION public.audit_authorization_decision(text, text, text, text, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.audit_authorization_decision(text, text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.audit_authorization_decision(text, text, text, text, text, text) TO authenticated;


-- 5. Helper: is_system_role()
-- Identifies immutable system-level roles.
CREATE OR REPLACE FUNCTION public.is_system_role(p_role_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.roles
        WHERE name = p_role_name AND is_system = true
    );
END;
$$;

ALTER FUNCTION public.is_system_role(text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_system_role(text) FROM public;
GRANT EXECUTE ON FUNCTION public.is_system_role(text) TO authenticated;
