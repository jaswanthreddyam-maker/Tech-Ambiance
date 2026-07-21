-- ==============================================================================
-- MIGRATION: 0048_fix_convert_lead_rpc_signature.sql
-- PURPOSE: Grant DEFAULT NULL to p_admin_user_id in convert_lead_to_workspace
-- to prevent HTTP 400 parameter parsing errors when calling RPC from frontend.
-- ==============================================================================

BEGIN;

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
BEGIN
  -- Validate lead
  SELECT * INTO v_lead
  FROM public.lead_consultations
  WHERE id = p_lead_id AND archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found or is archived';
  END IF;

  v_name := COALESCE(
    nullif(trim(v_lead.business_name), ''), 
    nullif(trim(v_lead.contact_name), ''), 
    'Client Account'
  );

  -- Create URL-friendly unique slug
  v_slug := lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);

  -- 1. Create Organization
  INSERT INTO public.organizations (name, slug, billing_email)
  VALUES (v_name, v_slug, COALESCE(v_lead.contact_email, 'client@techambiance.com'))
  RETURNING id INTO v_org_id;

  -- 2. Create Workspace
  INSERT INTO public.workspaces (organization_id, name, slug, primary_contact_name, primary_contact_email)
  VALUES (
    v_org_id, 
    v_name, 
    v_slug, 
    COALESCE(v_lead.contact_name, 'Primary Contact'), 
    COALESCE(v_lead.contact_email, 'client@techambiance.com')
  )
  RETURNING id INTO v_workspace_id;

  -- 3. Create Project
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

  -- 4. Grant Admin Membership in Organization & Workspace
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, v_admin_id, 'OWNER')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (v_workspace_id, v_admin_id, 'OWNER')
    ON CONFLICT DO NOTHING;
  END IF;

  -- 5. Update Lead status to WON
  UPDATE public.lead_consultations
  SET status = 'WON'
  WHERE id = p_lead_id;

  -- 6. Log Lead Activity Event
  INSERT INTO public.lead_events (lead_id, event_type, payload)
  VALUES (
    p_lead_id, 
    'LEAD_WON', 
    jsonb_build_object(
      'converted_by', v_admin_id,
      'organization_id', v_org_id,
      'workspace_id', v_workspace_id,
      'project_id', v_project_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'organization_id', v_org_id,
    'workspace_id', v_workspace_id,
    'project_id', v_project_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.convert_lead_to_workspace(UUID, UUID) TO authenticated, anon;

COMMIT;
