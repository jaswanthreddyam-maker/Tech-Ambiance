-- ==============================================================================
-- PHASE C7.4: Projects Module RLS
-- ==============================================================================
-- Additive migration for projects, milestones, deliverable_files, timeline_events,
-- and client_journey_events.
-- Utilizes two-axis authorization (Tenant Scope + Permission Scope).
-- ==============================================================================

BEGIN;

-- 1. Insert missing Project permissions
INSERT INTO public.permissions (id, module, name, description)
VALUES 
  ('project:write', 'Portfolio', 'Write Projects', 'Allows creating and updating projects.'),
  ('project:delete', 'Portfolio', 'Delete Projects', 'Allows deleting projects.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.permission_group_permissions (permission_id, group_id)
SELECT 'project:write', id FROM public.permission_groups WHERE name = 'Portfolio Manager'
UNION ALL
SELECT 'project:delete', id FROM public.permission_groups WHERE name = 'Portfolio Manager'
ON CONFLICT DO NOTHING;

-- 2. Create Abstraction Helpers
CREATE OR REPLACE FUNCTION public.get_project_organization_id(p_project_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT w.organization_id
  FROM public.projects p
  JOIN public.workspaces w ON p.workspace_id = w.id
  WHERE p.id = p_project_id;
$$;
ALTER FUNCTION public.get_project_organization_id(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_project_organization_id(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_project_organization_id(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.project_visible(p_project_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.tenant_can_access(public.get_project_organization_id(p_project_id));
$$;
ALTER FUNCTION public.project_visible(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.project_visible(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.project_visible(uuid) TO authenticated;

-- 3. Table: projects
-- Projects derive their organization_id through workspace_id.
CREATE POLICY "project_admin_read" ON public.projects FOR SELECT TO authenticated
USING (
    public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
    AND public.has_permission('project:read')
);

CREATE POLICY "project_admin_insert" ON public.projects FOR INSERT TO authenticated
WITH CHECK (
    public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_update" ON public.projects FOR UPDATE TO authenticated
USING (
    public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
    AND public.has_permission('project:write')
)
WITH CHECK (
    public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_delete" ON public.projects FOR DELETE TO authenticated
USING (
    public.tenant_can_access(public.get_workspace_organization_id(workspace_id))
    AND public.has_permission('project:delete')
);

-- 4. Table: milestones
-- Milestones derive their organization_id through project_id -> workspace_id
CREATE POLICY "project_admin_read" ON public.milestones FOR SELECT TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:read')
);

CREATE POLICY "project_admin_insert" ON public.milestones FOR INSERT TO authenticated
WITH CHECK (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_update" ON public.milestones FOR UPDATE TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
)
WITH CHECK (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_delete" ON public.milestones FOR DELETE TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:delete')
);

-- 5. Table: deliverable_files
CREATE POLICY "project_admin_read" ON public.deliverable_files FOR SELECT TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:read')
);

CREATE POLICY "project_admin_insert" ON public.deliverable_files FOR INSERT TO authenticated
WITH CHECK (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_update" ON public.deliverable_files FOR UPDATE TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
)
WITH CHECK (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_delete" ON public.deliverable_files FOR DELETE TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:delete')
);

-- 6. Table: timeline_events
CREATE POLICY "project_admin_read" ON public.timeline_events FOR SELECT TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:read')
);

CREATE POLICY "project_admin_insert" ON public.timeline_events FOR INSERT TO authenticated
WITH CHECK (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_update" ON public.timeline_events FOR UPDATE TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
)
WITH CHECK (
    public.project_visible(project_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_delete" ON public.timeline_events FOR DELETE TO authenticated
USING (
    public.project_visible(project_id)
    AND public.has_permission('project:delete')
);

-- 7. Table: client_journey_events
-- Directly tied to organization_id
CREATE POLICY "project_admin_read" ON public.client_journey_events FOR SELECT TO authenticated
USING (
    public.tenant_can_access(organization_id)
    AND public.has_permission('project:read')
);

CREATE POLICY "project_admin_insert" ON public.client_journey_events FOR INSERT TO authenticated
WITH CHECK (
    public.tenant_can_access(organization_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_update" ON public.client_journey_events FOR UPDATE TO authenticated
USING (
    public.tenant_can_access(organization_id)
    AND public.has_permission('project:write')
)
WITH CHECK (
    public.tenant_can_access(organization_id)
    AND public.has_permission('project:write')
);

CREATE POLICY "project_admin_delete" ON public.client_journey_events FOR DELETE TO authenticated
USING (
    public.tenant_can_access(organization_id)
    AND public.has_permission('project:delete')
);

COMMIT;
