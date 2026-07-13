-- ==============================================================================
-- MIGRATION: 0020_lock_down_crm_rls.sql
-- PURPOSE: Replace permissive CRM RLS policies with role-gated access.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.has_crm_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.user_id = auth.uid()
      AND au.is_active = true
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('OWNER', 'ADMIN', 'SALES', 'STRATEGIST')
  );
$$;

REVOKE ALL ON FUNCTION public.has_crm_access() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_crm_access() TO authenticated;

DROP POLICY IF EXISTS "Admin view all stages" ON public.crm_pipeline_stages;
DROP POLICY IF EXISTS "Admin view all leads" ON public.lead_consultations;
DROP POLICY IF EXISTS "Admin view all lead_events" ON public.lead_events;
DROP POLICY IF EXISTS "Admin view all stage history" ON public.crm_stage_history;

CREATE POLICY "CRM roles can view stages"
  ON public.crm_pipeline_stages
  FOR SELECT
  TO authenticated
  USING (public.has_crm_access());

CREATE POLICY "CRM roles can view leads"
  ON public.lead_consultations
  FOR SELECT
  TO authenticated
  USING (public.has_crm_access());

CREATE POLICY "CRM roles can update leads"
  ON public.lead_consultations
  FOR UPDATE
  TO authenticated
  USING (public.has_crm_access())
  WITH CHECK (public.has_crm_access());

CREATE POLICY "CRM roles can delete leads"
  ON public.lead_consultations
  FOR DELETE
  TO authenticated
  USING (public.has_crm_access());

CREATE POLICY "CRM roles can view lead events"
  ON public.lead_events
  FOR SELECT
  TO authenticated
  USING (public.has_crm_access());

CREATE POLICY "CRM roles can write lead events"
  ON public.lead_events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_crm_access());

CREATE POLICY "CRM roles can view stage history"
  ON public.crm_stage_history
  FOR SELECT
  TO authenticated
  USING (public.has_crm_access());

CREATE POLICY "CRM roles can write stage history"
  ON public.crm_stage_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_crm_access());

REVOKE INSERT ON public.lead_consultations FROM anon;
REVOKE INSERT ON public.lead_consultations FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_consultation_lead(JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_consultation_lead(JSONB, TEXT) TO authenticated;

COMMIT;
