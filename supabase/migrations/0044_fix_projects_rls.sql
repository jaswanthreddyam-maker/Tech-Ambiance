-- ==============================================================================
-- PHASE C7.5: Projects Module RLS Fix (Self-Contained & Idempotent)
-- ==============================================================================
-- Defines workspace/organization helper functions and updates RLS policies on
-- public.projects and public.milestones to permit Admin Users, Workspace Members,
-- and Authorized RBAC Permission Holders to Insert, Update, Select, and Delete.
-- Fixes error 42883 ("function get_workspace_organization_id does not exist") and 
-- error 42501 ("new row violates row-level security policy for table 'projects'").
-- ==============================================================================

BEGIN;

-- 1. Helper Function: get_workspace_organization_id
CREATE OR REPLACE FUNCTION public.get_workspace_organization_id(p_workspace_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT organization_id FROM public.workspaces WHERE id = p_workspace_id;
$$;

ALTER FUNCTION public.get_workspace_organization_id(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_workspace_organization_id(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_workspace_organization_id(uuid) TO authenticated;

-- 2. Helper Function: tenant_can_access
CREATE OR REPLACE FUNCTION public.tenant_can_access(tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'organization_id')::uuid = tenant_id 
    OR public.has_permission('system:read');
$$;

ALTER FUNCTION public.tenant_can_access(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_can_access(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.tenant_can_access(uuid) TO authenticated;

-- 3. Helper Function: is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid() AND is_active = true
  ) 
  OR public.has_permission('system:read') 
  OR public.has_permission('project:write');
$$;

ALTER FUNCTION public.is_admin_user() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_admin_user() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

-- 4. Helper Function: is_workspace_member
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = p_workspace_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.organization_members om
    JOIN public.workspaces w ON w.organization_id = om.organization_id
    WHERE w.id = p_workspace_id AND om.user_id = auth.uid()
  );
$$;

ALTER FUNCTION public.is_workspace_member(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_workspace_member(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;

-- 5. Drop existing restrictive policies on projects
DROP POLICY IF EXISTS "project_admin_read" ON public.projects;
DROP POLICY IF EXISTS "project_admin_insert" ON public.projects;
DROP POLICY IF EXISTS "project_admin_update" ON public.projects;
DROP POLICY IF EXISTS "project_admin_delete" ON public.projects;

-- 6. Create resilient projects RLS policies
CREATE POLICY "project_admin_read" ON public.projects FOR SELECT TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member(workspace_id)
    OR (
      public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
      AND public.has_permission('project:read')
    )
);

CREATE POLICY "project_admin_insert" ON public.projects FOR INSERT TO authenticated
WITH CHECK (
    public.is_admin_user()
    OR public.is_workspace_member(workspace_id)
    OR (
      public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
      AND public.has_permission('project:write')
    )
);

CREATE POLICY "project_admin_update" ON public.projects FOR UPDATE TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member(workspace_id)
    OR (
      public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
      AND public.has_permission('project:write')
    )
)
WITH CHECK (
    public.is_admin_user()
    OR public.is_workspace_member(workspace_id)
    OR (
      public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
      AND public.has_permission('project:write')
    )
);

CREATE POLICY "project_admin_delete" ON public.projects FOR DELETE TO authenticated
USING (
    public.is_admin_user()
    OR (
      public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
      AND public.has_permission('project:delete')
    )
);

-- 7. Drop and recreate policies for milestones
DROP POLICY IF EXISTS "project_admin_read" ON public.milestones;
DROP POLICY IF EXISTS "project_admin_insert" ON public.milestones;
DROP POLICY IF EXISTS "project_admin_update" ON public.milestones;
DROP POLICY IF EXISTS "project_admin_delete" ON public.milestones;

CREATE POLICY "project_admin_read" ON public.milestones FOR SELECT TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member(public.get_workspace_organization_id((SELECT workspace_id FROM public.projects WHERE id = milestones.project_id)))
);

CREATE POLICY "project_admin_insert" ON public.milestones FOR INSERT TO authenticated
WITH CHECK (
    public.is_admin_user()
    OR public.is_workspace_member(public.get_workspace_organization_id((SELECT workspace_id FROM public.projects WHERE id = milestones.project_id)))
);

CREATE POLICY "project_admin_update" ON public.milestones FOR UPDATE TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member(public.get_workspace_organization_id((SELECT workspace_id FROM public.projects WHERE id = milestones.project_id)))
)
WITH CHECK (
    public.is_admin_user()
    OR public.is_workspace_member(public.get_workspace_organization_id((SELECT workspace_id FROM public.projects WHERE id = milestones.project_id)))
);

CREATE POLICY "project_admin_delete" ON public.milestones FOR DELETE TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member(public.get_workspace_organization_id((SELECT workspace_id FROM public.projects WHERE id = milestones.project_id)))
);

COMMIT;
