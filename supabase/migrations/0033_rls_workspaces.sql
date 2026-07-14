-- ==============================================================================
-- PHASE C7.2: Workspace Module RLS Rewrite
-- ==============================================================================
-- Additive migration implementing the Phase B5 frontend authorization contract.
-- Incorporates two-axis security (tenant x capability).
-- Legacy policies remain untouched and will be dropped in 0034.
-- ==============================================================================

BEGIN;

-- 1. Helper Function: tenant_can_access
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.tenant_can_access(tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT 
    public.current_organization_id() = tenant_id 
    OR public.has_permission('system:read');
$$;

ALTER FUNCTION public.tenant_can_access(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.tenant_can_access(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.tenant_can_access(uuid) TO authenticated;

-- Helper to break RLS recursion when looking up workspace's organization
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

-- 2. Base Grants
-- ==============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;

-- 3. Additive RLS Policies
-- ==============================================================================

-- Table: organizations
CREATE POLICY "workspace_admin_read" ON public.organizations FOR SELECT TO authenticated
USING (
  public.tenant_can_access(id) 
  AND public.has_permission('workspace:read')
);

CREATE POLICY "workspace_admin_update" ON public.organizations FOR UPDATE TO authenticated
USING (
  public.tenant_can_access(id) 
  AND public.has_permission('workspace:write')
)
WITH CHECK (
  public.tenant_can_access(id) 
  AND public.has_permission('workspace:write')
);
-- Note: INSERT and DELETE are deliberately omitted. Organizations are provisioned via RPC.

-- Table: workspaces
CREATE POLICY "workspace_admin_read" ON public.workspaces FOR SELECT TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:read')
);

CREATE POLICY "workspace_admin_update" ON public.workspaces FOR UPDATE TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
)
WITH CHECK (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
);
-- Note: INSERT and DELETE are deliberately omitted. Workspaces are provisioned via RPC.

-- Table: organization_members
CREATE POLICY "workspace_admin_read" ON public.organization_members FOR SELECT TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:read')
);

CREATE POLICY "workspace_admin_insert" ON public.organization_members FOR INSERT TO authenticated
WITH CHECK (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
);

CREATE POLICY "workspace_admin_update" ON public.organization_members FOR UPDATE TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
)
WITH CHECK (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
);

CREATE POLICY "workspace_admin_delete" ON public.organization_members FOR DELETE TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
);

-- Table: workspace_members
CREATE POLICY "workspace_admin_read" ON public.workspace_members FOR SELECT TO authenticated
USING (
  public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
  AND public.has_permission('workspace:read')
);

CREATE POLICY "workspace_admin_insert" ON public.workspace_members FOR INSERT TO authenticated
WITH CHECK (
  public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
  AND public.has_permission('workspace:write')
);

CREATE POLICY "workspace_admin_update" ON public.workspace_members FOR UPDATE TO authenticated
USING (
  public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
  AND public.has_permission('workspace:write')
)
WITH CHECK (
  public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
  AND public.has_permission('workspace:write')
);

CREATE POLICY "workspace_admin_delete" ON public.workspace_members FOR DELETE TO authenticated
USING (
  public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
  AND public.has_permission('workspace:write')
);

-- Table: invitations
-- TODO (RBAC v1.1): Replace workspace:write with workspace:invite once invitation permissions are introduced.
CREATE POLICY "workspace_admin_read" ON public.invitations FOR SELECT TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:read')
);

CREATE POLICY "workspace_admin_insert" ON public.invitations FOR INSERT TO authenticated
WITH CHECK (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
);

CREATE POLICY "workspace_admin_delete" ON public.invitations FOR DELETE TO authenticated
USING (
  public.tenant_can_access(organization_id) 
  AND public.has_permission('workspace:write')
);

COMMIT;
