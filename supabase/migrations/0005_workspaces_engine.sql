-- ==============================================================================
-- MIGRATION: 0005_workspaces_engine.sql
-- PURPOSE: Engine for converting CRM Leads to Delivery Workspaces
-- ==============================================================================

BEGIN;

-- 1. Enhance `workspaces` with client contact information
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS primary_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_contact_email TEXT;

-- 2. RPC: convert_lead_to_workspace
-- Transitions a won lead into the delivery engine by provisioning an org, workspace, and project.
CREATE OR REPLACE FUNCTION public.convert_lead_to_workspace(
  p_lead_id UUID,
  p_admin_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_lead RECORD;
  v_org_id UUID;
  v_workspace_id UUID;
  v_project_id UUID;
  v_slug TEXT;
BEGIN
  -- Validate lead
  SELECT * INTO v_lead
  FROM public.lead_consultations
  WHERE id = p_lead_id AND archived_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found or is archived';
  END IF;

  -- Create a slug from the business name
  v_slug := lower(regexp_replace(v_lead.business_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Ensure unique slug by appending a random suffix if needed (simplified for this RPC)
  v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4);

  -- 1. Create Organization
  INSERT INTO public.organizations (name, slug, billing_email)
  VALUES (v_lead.business_name, v_slug, v_lead.contact_email)
  RETURNING id INTO v_org_id;

  -- 2. Create Workspace
  INSERT INTO public.workspaces (organization_id, name, slug, primary_contact_name, primary_contact_email)
  VALUES (v_org_id, v_lead.business_name, v_slug, v_lead.contact_name, v_lead.contact_email)
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
    v_lead.business_name || ' Flagship', 
    v_slug, 
    'DISCOVERY', 
    'Active Execution', 
    v_lead.budget_range
  )
  RETURNING id INTO v_project_id;

  -- 4. Update Lead to WON
  UPDATE public.lead_consultations
  SET 
    status = 'WON',
    version = version + 1
  WHERE id = p_lead_id;

  -- 5. Log Timeline Event
  INSERT INTO public.lead_events (lead_id, event_type, payload)
  VALUES (
    p_lead_id, 
    'LEAD_WON', 
    jsonb_build_object(
      'converted_by', p_admin_user_id,
      'workspace_id', v_workspace_id,
      'project_id', v_project_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'workspace_id', v_workspace_id,
    'project_id', v_project_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. RPC: get_admin_workspaces
-- Aggregates data for the Workspaces Directory UI.
CREATE OR REPLACE FUNCTION public.get_admin_workspaces()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', w.id,
      'workspaceName', w.name,
      'slug', w.slug,
      'clientCompany', o.name,
      'primaryContactName', w.primary_contact_name,
      'primaryContactEmail', w.primary_contact_email,
      'status', 'ACTIVE',
      'projectCount', (SELECT COUNT(*) FROM public.projects p WHERE p.workspace_id = w.id),
      'activeStage', COALESCE((
        SELECT p.lifecycle_stage 
        FROM public.projects p 
        WHERE p.workspace_id = w.id 
        ORDER BY p.created_at DESC 
        LIMIT 1
      ), 'DISCOVERY'),
      'createdAt', w.created_at
    )
  ), '[]'::jsonb) INTO result
  FROM public.workspaces w
  JOIN public.organizations o ON w.organization_id = o.id
  ORDER BY w.created_at DESC;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
