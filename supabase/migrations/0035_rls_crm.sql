-- ==============================================================================
-- PHASE C7.3: CRM Module RLS Rewrite
-- ==============================================================================
-- Additive migration implementing the Phase B5 frontend authorization contract.
-- CRM resources are globally scoped (no tenant dimension).
-- Legacy policies remain untouched and will be dropped in 0036.
-- ==============================================================================

BEGIN;

-- 1. Base Grants
-- ==============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_consultations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_pipeline_stages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_stage_history TO authenticated;

-- 2. Additive RLS Policies
-- ==============================================================================

-- Table: lead_consultations
CREATE POLICY "crm_admin_read" ON public.lead_consultations FOR SELECT TO authenticated
USING (public.has_permission('crm:read'));

CREATE POLICY "crm_admin_insert" ON public.lead_consultations FOR INSERT TO authenticated
WITH CHECK (public.has_permission('crm:write'));

CREATE POLICY "crm_admin_update" ON public.lead_consultations FOR UPDATE TO authenticated
USING (public.has_permission('crm:write'))
WITH CHECK (public.has_permission('crm:write'));

CREATE POLICY "crm_admin_delete" ON public.lead_consultations FOR DELETE TO authenticated
USING (public.has_permission('crm:delete'));

-- Table: lead_events
CREATE POLICY "crm_admin_read" ON public.lead_events FOR SELECT TO authenticated
USING (public.has_permission('crm:read'));

CREATE POLICY "crm_admin_insert" ON public.lead_events FOR INSERT TO authenticated
WITH CHECK (public.has_permission('crm:write'));

CREATE POLICY "crm_admin_update" ON public.lead_events FOR UPDATE TO authenticated
USING (public.has_permission('crm:write'))
WITH CHECK (public.has_permission('crm:write'));

CREATE POLICY "crm_admin_delete" ON public.lead_events FOR DELETE TO authenticated
USING (public.has_permission('crm:delete'));

-- Table: crm_pipeline_stages
CREATE POLICY "crm_admin_read" ON public.crm_pipeline_stages FOR SELECT TO authenticated
USING (public.has_permission('crm:read'));

CREATE POLICY "crm_admin_insert" ON public.crm_pipeline_stages FOR INSERT TO authenticated
WITH CHECK (public.has_permission('system:read')); -- Usually stages are configured by system admins

CREATE POLICY "crm_admin_update" ON public.crm_pipeline_stages FOR UPDATE TO authenticated
USING (public.has_permission('system:read'))
WITH CHECK (public.has_permission('system:read'));

CREATE POLICY "crm_admin_delete" ON public.crm_pipeline_stages FOR DELETE TO authenticated
USING (public.has_permission('system:read'));

-- Table: crm_stage_history
CREATE POLICY "crm_admin_read" ON public.crm_stage_history FOR SELECT TO authenticated
USING (public.has_permission('crm:read'));

CREATE POLICY "crm_admin_insert" ON public.crm_stage_history FOR INSERT TO authenticated
WITH CHECK (public.has_permission('crm:write'));

CREATE POLICY "crm_admin_update" ON public.crm_stage_history FOR UPDATE TO authenticated
USING (public.has_permission('crm:write'))
WITH CHECK (public.has_permission('crm:write'));

CREATE POLICY "crm_admin_delete" ON public.crm_stage_history FOR DELETE TO authenticated
USING (public.has_permission('crm:delete'));

COMMIT;
