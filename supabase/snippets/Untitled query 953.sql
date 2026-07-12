DO $$
DECLARE
  v_workspace RECORD;
  v_project_id UUID;
  v_user_id UUID;
BEGIN
  -- Get any valid user
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please sign up first.';
  END IF;

  FOR v_workspace IN SELECT * FROM public.workspaces LOOP
    -- Create a test project for the workspace if one doesn't exist
    SELECT id INTO v_project_id FROM public.projects WHERE workspace_id = v_workspace.id LIMIT 1;

    IF v_project_id IS NULL THEN
      INSERT INTO public.projects (workspace_id, name, slug, status)
      VALUES (v_workspace.id, 'Enterprise Vault Testing Project', 'test-project-' || substr(md5(random()::text), 0, 6), 'ACTIVE')
      RETURNING id INTO v_project_id;
    END IF;

    -- Provision some test credentials for this project
    PERFORM public.create_project_credential(
      v_project_id, 
      'AWS Production Root', 
      'root-admin', 
      'Root access for the production cluster', 
      ARRAY['aws', 'prod'], 
      'PRODUCTION', 
      'Infrastructure', 
      'AWS', 
      'aws-sm://us-east-1/prod/root-key', 
      NOW() + INTERVAL '365 days',
      v_user_id
    );

    PERFORM public.create_project_credential(
      v_project_id, 
      'Stripe Live API Key', 
      null, 
      'Payment gateway restricted key', 
      ARRAY['stripe', 'payments'], 
      'PRODUCTION', 
      'Payments', 
      'VAULT', 
      'vault://payments/stripe/live', 
      NOW() + INTERVAL '10 days', 
      v_user_id
    );
  END LOOP;
END $$;
