-- ==============================================================================
-- MIGRATION: 0009_fix_admin_workspaces_rpc.sql
-- PURPOSE: Fix GROUP BY error in get_admin_workspaces RPC
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.get_admin_workspaces()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- We aggregate all workspace objects into a single JSON array.
  -- To order the array, the ORDER BY goes INSIDE the jsonb_agg function.
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', w.id,
        'workspaceName', w.name,
        'slug', w.slug,
        'clientCompany', o.name,
        'primaryContactName', w.primary_contact_name,
        'primaryContactEmail', w.primary_contact_email,
        'status', 'ACTIVE',
        'projectCount', (SELECT COUNT(*) FROM public.projects p WHERE p.workspace_id = w.id),
        'activeStage', COALESCE((
          SELECT p.lifecycle_stage 
          FROM public.projects p 
          WHERE p.workspace_id = w.id 
          ORDER BY p.created_at DESC 
          LIMIT 1
        ), 'DISCOVERY'),
        'createdAt', w.created_at
      )
      ORDER BY w.created_at DESC
    ), '[]'::jsonb
  ) INTO result
  FROM public.workspaces w
  JOIN public.organizations o ON w.organization_id = o.id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
