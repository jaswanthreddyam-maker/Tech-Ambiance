-- ==============================================================================
-- PHASE C7.3: CRM Module RLS Cleanup
-- ==============================================================================
-- Drops legacy role-based policies now that the additive `crm_admin_*` policies
-- are actively enforcing the B5 frontend contract.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
    legacy_count int;
BEGIN
    SELECT count(*) INTO legacy_count
    FROM pg_policies
    WHERE tablename IN (
        'lead_consultations', 
        'lead_events', 
        'crm_pipeline_stages', 
        'crm_stage_history'
    )
    AND policyname NOT LIKE 'crm_admin_%';
    
    RAISE NOTICE 'Found % legacy CRM policies to drop.', legacy_count;
END $$;

-- Table: lead_consultations
DROP POLICY IF EXISTS "CRM roles can view leads" ON public.lead_consultations;
DROP POLICY IF EXISTS "CRM roles can update leads" ON public.lead_consultations;
DROP POLICY IF EXISTS "CRM roles can delete leads" ON public.lead_consultations;

-- Table: lead_events
DROP POLICY IF EXISTS "CRM roles can view lead events" ON public.lead_events;
DROP POLICY IF EXISTS "CRM roles can write lead events" ON public.lead_events;

-- Table: crm_pipeline_stages
DROP POLICY IF EXISTS "CRM roles can view stages" ON public.crm_pipeline_stages;

-- Table: crm_stage_history
DROP POLICY IF EXISTS "CRM roles can view stage history" ON public.crm_stage_history;
DROP POLICY IF EXISTS "CRM roles can write stage history" ON public.crm_stage_history;

COMMIT;
