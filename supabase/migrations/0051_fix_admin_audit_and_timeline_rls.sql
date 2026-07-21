-- ==============================================================================
-- MIGRATION: 0051_fix_admin_audit_and_timeline_rls.sql
-- PURPOSE: Fix 403 Forbidden errors when inserting into admin_audit_logs 
-- and timeline_events from the StudioHQ Admin panel (/admin/workspaces).
-- ==============================================================================

BEGIN;

-- ============================================================================
-- 1. TABLE: admin_audit_logs
-- ============================================================================
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_logs_insert" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_select" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_update" ON public.admin_audit_logs;
DROP POLICY IF EXISTS "admin_audit_logs_delete" ON public.admin_audit_logs;

-- Any authenticated user (admin or client performing an action) can log audit entries
CREATE POLICY "admin_audit_logs_insert" ON public.admin_audit_logs 
FOR INSERT TO authenticated 
WITH CHECK (true);

-- Only admins can read audit logs
CREATE POLICY "admin_audit_logs_select" ON public.admin_audit_logs 
FOR SELECT TO authenticated 
USING (
    public.is_admin_user()
);

-- ============================================================================
-- 2. TABLE: timeline_events
-- ============================================================================
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_admin_read" ON public.timeline_events;
DROP POLICY IF EXISTS "project_admin_insert" ON public.timeline_events;
DROP POLICY IF EXISTS "project_admin_update" ON public.timeline_events;
DROP POLICY IF EXISTS "project_admin_delete" ON public.timeline_events;
DROP POLICY IF EXISTS "timeline_events_read" ON public.timeline_events;
DROP POLICY IF EXISTS "timeline_events_insert" ON public.timeline_events;
DROP POLICY IF EXISTS "timeline_events_update" ON public.timeline_events;
DROP POLICY IF EXISTS "timeline_events_delete" ON public.timeline_events;

CREATE POLICY "timeline_events_read" ON public.timeline_events 
FOR SELECT TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = timeline_events.project_id))
);

CREATE POLICY "timeline_events_insert" ON public.timeline_events 
FOR INSERT TO authenticated
WITH CHECK (
    public.is_admin_user()
    OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = timeline_events.project_id))
);

CREATE POLICY "timeline_events_update" ON public.timeline_events 
FOR UPDATE TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = timeline_events.project_id))
)
WITH CHECK (
    public.is_admin_user()
    OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = timeline_events.project_id))
);

CREATE POLICY "timeline_events_delete" ON public.timeline_events 
FOR DELETE TO authenticated
USING (
    public.is_admin_user()
    OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = timeline_events.project_id))
);

COMMIT;
