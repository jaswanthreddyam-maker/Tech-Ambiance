-- ==============================================================================
-- Add RPC for deleting organizations safely bypassing RLS for admins
-- ==============================================================================

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
