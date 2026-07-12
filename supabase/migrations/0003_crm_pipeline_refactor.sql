-- ==============================================================================
-- MIGRATION: 0003_crm_pipeline_refactor.sql
-- PURPOSE: Enterprise CRM Refactor - Agency Operating System
-- ==============================================================================

BEGIN;

-- 1. Create CRM Pipeline Stages Configuration Table
CREATE TABLE IF NOT EXISTS public.crm_pipeline_stages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Default Stages
INSERT INTO public.crm_pipeline_stages (id, name, color, sort_order) VALUES
  ('NEW', 'New Lead', 'border-blue-500/40 text-blue-700 bg-blue-50/50', 10),
  ('CONTACTED', 'Contacted', 'border-purple-500/40 text-purple-700 bg-purple-50/50', 20),
  ('DISCOVERY', 'Discovery', 'border-indigo-500/40 text-indigo-700 bg-indigo-50/50', 30),
  ('PROPOSAL_SENT', 'Proposal Sent', 'border-amber-500/40 text-amber-800 bg-amber-50/50', 40),
  ('NEGOTIATION', 'Negotiation', 'border-[#C9A56A]/60 text-[#9A7B4F] bg-[#C9A56A]/10', 50),
  ('WON', 'Won Deal', 'border-emerald-600/50 text-emerald-800 bg-emerald-50/80', 60),
  ('LOST', 'Lost', 'border-red-500/40 text-red-700 bg-red-50/50', 70)
ON CONFLICT (id) DO NOTHING;

-- 2. Alter Existing lead_consultations Table
-- Assuming it exists from 0002_agency_os_domains.sql
ALTER TABLE public.lead_consultations
  ADD COLUMN IF NOT EXISTS lead_number TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lead_source TEXT,
  ADD COLUMN IF NOT EXISTS consultation_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- Alter default status to 'NEW' instead of 'PENDING_REVIEW'
ALTER TABLE public.lead_consultations ALTER COLUMN status SET DEFAULT 'NEW';

-- 3. Sequence for Lead Numbers
CREATE SEQUENCE IF NOT EXISTS lead_number_seq START 1;

-- Trigger Function to generate LEAD-YYYY-XXXXXX and handle optimistic concurrency
CREATE OR REPLACE FUNCTION generate_lead_number_and_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate Lead Number on Insert
  IF TG_OP = 'INSERT' THEN
    NEW.lead_number := 'LEAD-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('lead_number_seq')::text, 6, '0');
    NEW.version := 1;
    NEW.status := COALESCE(NEW.status, 'NEW');
  END IF;

  -- Enforce Optimistic Concurrency on Update
  IF TG_OP = 'UPDATE' THEN
    IF NEW.version != OLD.version THEN
      RAISE EXCEPTION 'Optimistic concurrency failure: Version mismatch. Expected %, but got %', OLD.version, NEW.version;
    END IF;
    NEW.version := OLD.version + 1;
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_consultations_trigger ON public.lead_consultations;
CREATE TRIGGER lead_consultations_trigger
  BEFORE INSERT OR UPDATE ON public.lead_consultations
  FOR EACH ROW
  EXECUTE FUNCTION generate_lead_number_and_version();

-- 4. Audit Timeline & Analytics Tables
CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.lead_consultations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crm_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.lead_consultations(id) ON DELETE CASCADE,
  from_stage_id TEXT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL,
  to_stage_id TEXT NOT NULL REFERENCES public.crm_pipeline_stages(id) ON DELETE RESTRICT,
  changed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds BIGINT NULL
);

-- Trigger Function for Stage History & Timeline Event Logging
CREATE OR REPLACE FUNCTION log_lead_events_and_history()
RETURNS TRIGGER AS $$
DECLARE
  prev_stage_time TIMESTAMPTZ;
  duration_sec BIGINT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Insert LeadCreated Event
    INSERT INTO public.lead_events (lead_id, event_type, payload)
    VALUES (NEW.id, 'LeadCreated', jsonb_build_object('status', NEW.status, 'lead_source', NEW.lead_source));
    
    -- Insert Initial Stage History
    INSERT INTO public.crm_stage_history (lead_id, from_stage_id, to_stage_id)
    VALUES (NEW.id, NULL, NEW.status);
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      -- Insert StageChanged Event
      INSERT INTO public.lead_events (lead_id, event_type, payload)
      VALUES (NEW.id, 'StageChanged', jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status));
      
      -- Calculate Duration in previous stage
      SELECT changed_at INTO prev_stage_time 
      FROM public.crm_stage_history 
      WHERE lead_id = NEW.id 
      ORDER BY changed_at DESC LIMIT 1;
      
      IF prev_stage_time IS NOT NULL THEN
        duration_sec := EXTRACT(EPOCH FROM (NOW() - prev_stage_time));
      END IF;

      -- Insert new Stage History
      INSERT INTO public.crm_stage_history (lead_id, from_stage_id, to_stage_id, duration_seconds)
      VALUES (NEW.id, OLD.status, NEW.status, duration_sec);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_events_trigger ON public.lead_consultations;
CREATE TRIGGER lead_events_trigger
  AFTER INSERT OR UPDATE ON public.lead_consultations
  FOR EACH ROW
  EXECUTE FUNCTION log_lead_events_and_history();

-- 5. RPC function for idempotent lead creation (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION create_consultation_lead(
  payload JSONB,
  idempotency_key TEXT
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  inserted_lead JSONB;
BEGIN
  -- Idempotency Check
  -- For simplicity, check if a lead with this exact email was created within the last 5 minutes.
  IF EXISTS (
    SELECT 1 FROM public.lead_consultations 
    WHERE contact_email = payload->>'contact_email' 
    AND created_at > (NOW() - INTERVAL '5 minutes')
  ) THEN
    -- Return error or simply return the existing lead (idempotent response)
    RAISE EXCEPTION 'Idempotency failure: Duplicate submission detected for this email within 5 minutes.';
  END IF;

  INSERT INTO public.lead_consultations (
    business_name, industry, website, instagram, city, heard_source,
    goals, budget_range, timeline, contact_name, contact_phone, contact_email,
    preferred_contact, message, lead_source, consultation_snapshot
  ) VALUES (
    payload->>'business_name',
    payload->>'industry',
    payload->>'website',
    payload->>'instagram',
    payload->>'city',
    payload->>'heard_source',
    ARRAY(SELECT jsonb_array_elements_text(payload->'goals')),
    payload->>'budget_range',
    payload->>'timeline',
    payload->>'contact_name',
    payload->>'contact_phone',
    payload->>'contact_email',
    payload->>'preferred_contact',
    payload->>'message',
    COALESCE(payload->>'lead_source', 'Website'),
    payload
  )
  RETURNING to_jsonb(lead_consultations.*) INTO inserted_lead;

  RETURN inserted_lead;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS and setup policies
ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_consultations ENABLE ROW LEVEL SECURITY;

-- Admins can view/edit everything
CREATE POLICY "Admin view all stages" ON public.crm_pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Admin view all leads" ON public.lead_consultations FOR ALL USING (true);
CREATE POLICY "Admin view all lead_events" ON public.lead_events FOR ALL USING (true);
CREATE POLICY "Admin view all stage history" ON public.crm_stage_history FOR ALL USING (true);

-- Revoke direct table inserts from public/anon
REVOKE INSERT ON public.lead_consultations FROM anon;
REVOKE INSERT ON public.lead_consultations FROM authenticated;
GRANT EXECUTE ON FUNCTION create_consultation_lead(JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_consultation_lead(JSONB, TEXT) TO authenticated;

COMMIT;
