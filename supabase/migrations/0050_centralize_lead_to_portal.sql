-- ==============================================================================
-- MIGRATION: 0050_centralize_lead_to_portal.sql
-- PURPOSE: Centralize the Lead → Workspace → Client Portal provisioning pipeline.
--
-- Implements:
--   1. user_id column on lead_consultations (links lead to authenticated client)
--   2. provisioning_status column on lead_consultations (PENDING_PROVISION, PROVISIONED, MANUAL_LINK_REQUIRED)
--   3. Rewritten convert_lead_to_workspace RPC (fully transactional, idempotent, audit trail)
--   4. New provision_client_access RPC (manual linking for historical/unlinked leads)
--   5. Updated create_consultation_lead RPC (captures auth.uid() automatically)
--
-- Architecture Decision Record: ADR-003
--   - organization_members + workspace_members are the ONLY authoritative ownership model.
--   - profiles.active_* is UI convenience state, never authorization state.
--   - user_id (UUID) is the only trusted identity link. No email matching.
--   - All provisioning is fully transactional. No half-provisioned tenants.
-- ==============================================================================

BEGIN;

-- ============================================================================
-- 1. SCHEMA ADDITIONS
-- ============================================================================

-- 1a. Add user_id to lead_consultations (nullable — leads can exist without accounts)
ALTER TABLE public.lead_consultations 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 1b. Add provisioning_status to track tenant provisioning state
ALTER TABLE public.lead_consultations
  ADD COLUMN IF NOT EXISTS provisioning_status TEXT NOT NULL DEFAULT 'NOT_APPLICABLE';
-- Valid values: NOT_APPLICABLE, PENDING_PROVISION, PROVISIONED, MANUAL_LINK_REQUIRED

-- 1c. Index for efficient lookups by user_id
CREATE INDEX IF NOT EXISTS idx_lead_consultations_user_id 
  ON public.lead_consultations(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 2. REWRITE: convert_lead_to_workspace (Fully Transactional + Idempotent)
-- ============================================================================
-- This is the SINGLE POINT of tenant provisioning.
-- It atomically provisions: Organization → Workspace → Project → Memberships → Profile
-- All or nothing. No half-provisioned tenants.

CREATE OR REPLACE FUNCTION public.convert_lead_to_workspace(
  p_lead_id UUID,
  p_admin_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
  v_org_id UUID;
  v_workspace_id UUID;
  v_project_id UUID;
  v_slug TEXT;
  v_name TEXT;
  v_admin_id UUID := COALESCE(p_admin_user_id, auth.uid());
  v_client_user_id UUID;
  v_provisioning_status TEXT;
BEGIN
  -- ── Step 1: Validate lead ──────────────────────────────────────────────
  SELECT * INTO v_lead
  FROM public.lead_consultations
  WHERE id = p_lead_id AND archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found or is archived';
  END IF;

  -- ── Step 2: Idempotency guard ─────────────────────────────────────────
  -- If already converted (status = 'WON'), return the existing result
  IF v_lead.status = 'WON' THEN
    -- Find the existing provisioning audit event
    RETURN jsonb_build_object(
      'success', true,
      'already_provisioned', true,
      'message', 'Lead was already converted. No changes made.'
    );
  END IF;

  -- ── Step 3: Derive naming ─────────────────────────────────────────────
  v_name := COALESCE(
    nullif(trim(v_lead.business_name), ''), 
    nullif(trim(v_lead.contact_name), ''), 
    'Client Account'
  );

  v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);

  -- ── Step 4: Create Organization ───────────────────────────────────────
  INSERT INTO public.organizations (name, slug, billing_email)
  VALUES (v_name, v_slug, COALESCE(v_lead.contact_email, 'client@techambiance.com'))
  RETURNING id INTO v_org_id;

  -- ── Step 5: Create Workspace ──────────────────────────────────────────
  INSERT INTO public.workspaces (organization_id, name, slug, primary_contact_name, primary_contact_email)
  VALUES (
    v_org_id, 
    v_name, 
    v_slug, 
    COALESCE(v_lead.contact_name, 'Primary Contact'), 
    COALESCE(v_lead.contact_email, 'client@techambiance.com')
  )
  RETURNING id INTO v_workspace_id;

  -- ── Step 6: Create Project ────────────────────────────────────────────
  INSERT INTO public.projects (
    workspace_id, 
    name, 
    slug, 
    lifecycle_stage, 
    status, 
    budget_formatted
  )
  VALUES (
    v_workspace_id, 
    v_name || ' Flagship', 
    v_slug || '-proj', 
    'DISCOVERY', 
    'ACTIVE', 
    COALESCE(v_lead.budget_range, '25K-50K')
  )
  RETURNING id INTO v_project_id;

  -- ── Step 7: Grant Admin Membership (idempotent) ───────────────────────
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role, is_default)
    VALUES (v_org_id, v_admin_id, 'OWNER', true)
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_workspace_id, v_admin_id, 'OWNER')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;

  -- ── Step 8: Grant Client Membership (idempotent) ──────────────────────
  -- Only trust user_id. Never email matching.
  v_client_user_id := v_lead.user_id;

  IF v_client_user_id IS NOT NULL THEN
    -- 8a. Add client to organization_members
    INSERT INTO public.organization_members (organization_id, user_id, role, is_default)
    VALUES (v_org_id, v_client_user_id, 'CLIENT', true)
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- 8b. Add client to workspace_members  
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_workspace_id, v_client_user_id, 'CLIENT')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;

    -- 8c. Update profiles.active_* ONLY if currently NULL
    -- This is UI convenience state, not authorization state.
    UPDATE public.profiles
    SET 
      active_organization_id = COALESCE(active_organization_id, v_org_id),
      active_workspace_id = COALESCE(active_workspace_id, v_workspace_id)
    WHERE id = v_client_user_id
      AND (active_organization_id IS NULL OR active_workspace_id IS NULL);

    v_provisioning_status := 'PROVISIONED';
  ELSE
    -- No user_id → client hasn't registered yet or lead was submitted anonymously
    v_provisioning_status := 'MANUAL_LINK_REQUIRED';
  END IF;

  -- ── Step 9: Update Lead Status ────────────────────────────────────────
  UPDATE public.lead_consultations
  SET 
    status = 'WON',
    provisioning_status = v_provisioning_status
  WHERE id = p_lead_id;

  -- ── Step 10: Audit Trail ──────────────────────────────────────────────
  -- Complete provenance record for the entire conversion
  INSERT INTO public.lead_events (lead_id, event_type, payload)
  VALUES (
    p_lead_id, 
    'LEAD_WON', 
    jsonb_build_object(
      'converted_by', v_admin_id,
      'organization_id', v_org_id,
      'workspace_id', v_workspace_id,
      'project_id', v_project_id,
      'client_user_id', v_client_user_id,
      'provisioning_status', v_provisioning_status,
      'converted_at', now()::text
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'workspace_id', v_workspace_id,
    'project_id', v_project_id,
    'client_user_id', v_client_user_id,
    'provisioning_status', v_provisioning_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.convert_lead_to_workspace(UUID, UUID) TO authenticated, anon;


-- ============================================================================
-- 3. NEW RPC: provision_client_access (Manual Linking)
-- ============================================================================
-- Used by admins to link an existing user account to a workspace
-- after the lead was already converted (e.g., client registered late).

CREATE OR REPLACE FUNCTION public.provision_client_access(
  p_lead_id UUID,
  p_client_user_id UUID,
  p_admin_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
  v_org_id UUID;
  v_workspace_id UUID;
  v_project_id UUID;
  v_admin_id UUID := COALESCE(p_admin_user_id, auth.uid());
BEGIN
  -- ── Validate lead ─────────────────────────────────────────────────────
  SELECT * INTO v_lead
  FROM public.lead_consultations
  WHERE id = p_lead_id AND archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found or is archived';
  END IF;

  IF v_lead.status != 'WON' THEN
    RAISE EXCEPTION 'Lead must be in WON status before provisioning client access';
  END IF;

  -- ── Validate client user exists ───────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_client_user_id) THEN
    RAISE EXCEPTION 'Client user account not found';
  END IF;

  -- ── Find the provisioned workspace/org from the conversion event ──────
  SELECT 
    (payload->>'organization_id')::UUID,
    (payload->>'workspace_id')::UUID,
    (payload->>'project_id')::UUID
  INTO v_org_id, v_workspace_id, v_project_id
  FROM public.lead_events
  WHERE lead_id = p_lead_id AND event_type = 'LEAD_WON'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_org_id IS NULL OR v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'No provisioning record found for this lead. Was it converted?';
  END IF;

  -- ── Grant Client Membership (idempotent) ──────────────────────────────
  INSERT INTO public.organization_members (organization_id, user_id, role, is_default)
  VALUES (v_org_id, p_client_user_id, 'CLIENT', true)
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_client_user_id, 'CLIENT')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- ── Update profiles.active_* ONLY if currently NULL ───────────────────
  UPDATE public.profiles
  SET 
    active_organization_id = COALESCE(active_organization_id, v_org_id),
    active_workspace_id = COALESCE(active_workspace_id, v_workspace_id)
  WHERE id = p_client_user_id
    AND (active_organization_id IS NULL OR active_workspace_id IS NULL);

  -- ── Update lead record ────────────────────────────────────────────────
  UPDATE public.lead_consultations
  SET 
    user_id = p_client_user_id,
    provisioning_status = 'PROVISIONED'
  WHERE id = p_lead_id;

  -- ── Audit Trail ───────────────────────────────────────────────────────
  INSERT INTO public.lead_events (lead_id, event_type, payload)
  VALUES (
    p_lead_id,
    'CLIENT_ACCESS_PROVISIONED',
    jsonb_build_object(
      'provisioned_by', v_admin_id,
      'client_user_id', p_client_user_id,
      'organization_id', v_org_id,
      'workspace_id', v_workspace_id,
      'project_id', v_project_id,
      'provisioned_at', now()::text
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'workspace_id', v_workspace_id,
    'project_id', v_project_id,
    'client_user_id', p_client_user_id,
    'provisioning_status', 'PROVISIONED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.provision_client_access(UUID, UUID, UUID) TO authenticated;


-- ============================================================================
-- 4. UPDATE: create_consultation_lead (Capture auth.uid())
-- ============================================================================
-- Automatically captures the authenticated user's ID when submitting a consultation.
-- For anonymous submissions (anon role), user_id will be NULL.

CREATE OR REPLACE FUNCTION public.create_consultation_lead(
  payload JSONB,
  idempotency_key TEXT
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  inserted_lead JSONB;
  v_user_id UUID := auth.uid(); -- NULL for anonymous submissions
BEGIN
  -- Idempotency Check
  IF EXISTS (
    SELECT 1 FROM public.lead_consultations 
    WHERE contact_email = payload->>'contact_email' 
    AND created_at > (NOW() - INTERVAL '5 minutes')
  ) THEN
    RAISE EXCEPTION 'Idempotency failure: Duplicate submission detected for this email within 5 minutes.';
  END IF;

  INSERT INTO public.lead_consultations (
    business_name, industry, website, instagram, city, heard_source,
    goals, budget_range, timeline, contact_name, contact_phone, contact_email,
    preferred_contact, message, lead_source, consultation_snapshot,
    user_id, provisioning_status
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
    payload,
    v_user_id,
    CASE WHEN v_user_id IS NOT NULL THEN 'PENDING_PROVISION' ELSE 'NOT_APPLICABLE' END
  )
  RETURNING to_jsonb(lead_consultations.*) INTO inserted_lead;

  RETURN inserted_lead;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.create_consultation_lead(JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_consultation_lead(JSONB, TEXT) TO authenticated;


COMMIT;
