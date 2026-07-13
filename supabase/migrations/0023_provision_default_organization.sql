-- ==============================================================================
-- TECH AMBIANCE STUDIOHQ: PROVISION DEFAULT ORGANIZATION & RELOAD SCHEMA CACHE
-- ==============================================================================

DO $$ 
DECLARE
  v_org_id UUID;
  v_workspace_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Create Default Organization if not exists
  SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'tech-ambiance-studio' LIMIT 1;
  
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, slug)
    VALUES ('Tech Ambiance Studio', 'tech-ambiance-studio')
    RETURNING id INTO v_org_id;
  END IF;

  -- 2. Create Default Workspace if not exists
  SELECT id INTO v_workspace_id FROM public.workspaces WHERE organization_id = v_org_id LIMIT 1;
  
  IF v_workspace_id IS NULL THEN
    INSERT INTO public.workspaces (organization_id, name, slug, is_default, status)
    VALUES (v_org_id, 'Primary Workspace', 'tech-ambiance-workspace', true, 'ACTIVE')
    RETURNING id INTO v_workspace_id;
  END IF;

  -- 3. Provision Jaswanth's Profile
  FOR v_user_id IN
    SELECT id FROM public.profiles WHERE LOWER(email) IN ('jaswanthreddyam@gmail.com', 'jeshu0069@gmail.com')
  LOOP
    -- Update Profile to link to org and workspace
    UPDATE public.profiles
    SET active_organization_id = v_org_id,
        active_workspace_id = v_workspace_id
    WHERE id = v_user_id;

    -- Add to Organization Members
    INSERT INTO public.organization_members (organization_id, user_id, is_default)
    VALUES (v_org_id, v_user_id, true)
    ON CONFLICT DO NOTHING;

    -- Add to Workspace Members
    INSERT INTO public.workspace_members (workspace_id, user_id)
    VALUES (v_workspace_id, v_user_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Force PostgREST to reload schema cache to fix 404s on projections and views
NOTIFY pgrst, 'reload schema';

