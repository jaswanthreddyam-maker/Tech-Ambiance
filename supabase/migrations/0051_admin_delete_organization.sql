-- ==============================================================================
-- Fix is_admin_user to correctly check user_roles and add organization delete RPC
-- ==============================================================================

-- 1. Fix is_admin_user() which previously checked non-existent profiles.role
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = v_uid AND is_active = true
  ) 
  OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_uid AND r.name IN ('ADMIN', 'OWNER', 'SUPER_ADMIN')
  )
  OR public.has_permission('system:read'::text) 
  OR public.has_permission('project:write'::text);
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

ALTER FUNCTION public.is_admin_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- 2. Add RPC for deleting organizations safely bypassing RLS for admins
CREATE OR REPLACE FUNCTION public.delete_organization_admin(p_org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Validate permission: Only system admins can delete organizations
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Unauthorized: Only system administrators can delete organizations.';
  END IF;

  DELETE FROM public.organizations WHERE id = p_org_id;
END;
$$;

-- Grant execution to authenticated users (function logic handles actual auth check)
GRANT EXECUTE ON FUNCTION public.delete_organization_admin(UUID) TO authenticated;
