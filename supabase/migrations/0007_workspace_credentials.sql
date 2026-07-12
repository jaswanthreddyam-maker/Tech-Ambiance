-- ==============================================================================
-- MIGRATION: 0007_workspace_credentials.sql
-- PURPOSE: Enterprise Credentials Vault Architecture
-- ==============================================================================

BEGIN;

-- 1. Create Credentials Metadata Table
CREATE TABLE IF NOT EXISTS public.project_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT NULL,
  description TEXT NULL,
  tags TEXT[] NULL,
  environment TEXT NULL,
  category TEXT NOT NULL, -- 'Infrastructure', 'Development', 'Analytics', 'Payments', 'Domains', 'Email', 'Storage', 'Third-party APIs'
  provider TEXT NOT NULL DEFAULT 'LOCAL', -- 'SUPABASE', 'AWS', 'DOPPLER', 'VAULT', 'LOCAL'
  secret_reference TEXT NOT NULL, -- Opaque identifier (e.g. vault://...)
  version INTEGER NOT NULL DEFAULT 1,
  last_rotated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  last_viewed_at TIMESTAMPTZ NULL,
  last_viewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  archived_at TIMESTAMPTZ NULL,
  archived_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Credential Permissions Table
CREATE TABLE IF NOT EXISTS public.project_credential_permissions (
  credential_id UUID NOT NULL REFERENCES public.project_credentials(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- 'VIEW_METADATA', 'REVEAL_SECRET', 'MANAGE_CREDENTIAL'
  assigned_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (credential_id, role_id, permission_type)
);

-- 3. Create Audit Logs Table (Isolated from generic activity projection)
CREATE TABLE IF NOT EXISTS public.project_credential_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL REFERENCES public.project_credentials(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'VIEWED', 'COPIED'
  ip_address TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_credential_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_credential_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users can view metadata if they have the 'VIEW_METADATA' permission via their assigned roles.
CREATE POLICY "Users can select credential metadata based on permissions"
  ON public.project_credentials FOR SELECT
  USING (
    archived_at IS NULL AND
    EXISTS (
      SELECT 1 FROM public.project_credential_permissions pcp
      JOIN public.user_roles ur ON ur.role_id = pcp.role_id
      WHERE pcp.credential_id = public.project_credentials.id
        AND ur.user_id = auth.uid()
        AND pcp.permission_type IN ('VIEW_METADATA', 'REVEAL_SECRET', 'MANAGE_CREDENTIAL')
    )
  );

-- 6. RPC: Create Credential
CREATE OR REPLACE FUNCTION public.create_project_credential(
  p_project_id UUID,
  p_name TEXT,
  p_username TEXT,
  p_description TEXT,
  p_tags TEXT[],
  p_environment TEXT,
  p_category TEXT,
  p_provider TEXT,
  p_secret_reference TEXT,
  p_expires_at TIMESTAMPTZ,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_credential_id UUID;
  v_role_id UUID;
BEGIN
  -- Insert Credential
  INSERT INTO public.project_credentials (
    project_id, name, username, description, tags, environment, category, provider, secret_reference, expires_at
  ) VALUES (
    p_project_id, p_name, p_username, p_description, p_tags, p_environment, p_category, p_provider, p_secret_reference, p_expires_at
  ) RETURNING id INTO v_credential_id;

  -- Auto-assign basic permissions to OWNER and ADMIN
  FOR v_role_id IN (SELECT id FROM public.roles WHERE name IN ('OWNER', 'ADMIN', 'DEVELOPER')) LOOP
    -- Owner/Admin get all permissions
    IF (SELECT name FROM public.roles WHERE id = v_role_id) IN ('OWNER', 'ADMIN') THEN
      INSERT INTO public.project_credential_permissions (credential_id, role_id, permission_type, assigned_by)
      VALUES 
        (v_credential_id, v_role_id, 'VIEW_METADATA', p_actor_id),
        (v_credential_id, v_role_id, 'REVEAL_SECRET', p_actor_id),
        (v_credential_id, v_role_id, 'MANAGE_CREDENTIAL', p_actor_id);
    ELSE
      -- Developers get VIEW_METADATA
      INSERT INTO public.project_credential_permissions (credential_id, role_id, permission_type, assigned_by)
      VALUES (v_credential_id, v_role_id, 'VIEW_METADATA', p_actor_id);
    END IF;
  END LOOP;

  -- Append to Activity Projection (Project Timeline)
  INSERT INTO public.project_activity_projection (
    project_id, actor_id, event_type, payload
  ) VALUES (
    p_project_id, p_actor_id, 'CREDENTIAL_CREATED',
    jsonb_build_object('credential_id', v_credential_id, 'name', p_name, 'category', p_category)
  );

  RETURN jsonb_build_object('success', true, 'credential_id', v_credential_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: Reveal Credential Secret
CREATE OR REPLACE FUNCTION public.reveal_project_credential(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
  v_has_permission BOOLEAN;
BEGIN
  -- Check permission
  SELECT EXISTS (
    SELECT 1 FROM public.project_credential_permissions pcp
    JOIN public.user_roles ur ON ur.role_id = pcp.role_id
    WHERE pcp.credential_id = p_credential_id
      AND ur.user_id = p_actor_id
      AND pcp.permission_type = 'REVEAL_SECRET'
  ) INTO v_has_permission;

  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'Unauthorized: REVEAL_SECRET permission required';
  END IF;

  SELECT * INTO v_cred FROM public.project_credentials WHERE id = p_credential_id AND archived_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credential not found or archived';
  END IF;

  -- Log to isolated Audit Table (not Project Timeline)
  INSERT INTO public.project_credential_audit_logs (credential_id, actor_id, action)
  VALUES (p_credential_id, p_actor_id, 'VIEWED');

  -- Update last_viewed_at/by metadata
  UPDATE public.project_credentials
  SET last_viewed_at = NOW(), last_viewed_by = p_actor_id
  WHERE id = p_credential_id;

  -- In a real enterprise system, we would exchange the opaque secret_reference for the actual secret here.
  -- For this architecture demo, we simulate returning a temporary token/secret derived from the reference.
  RETURN jsonb_build_object(
    'success', true, 
    'secret_value', 'SIMULATED_DECRYPTED_SECRET_' || v_cred.secret_reference,
    'reveal_token_expires_in', 30
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: Record Credential Copied
CREATE OR REPLACE FUNCTION public.record_credential_copied(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
BEGIN
  -- Log to isolated Audit Table
  INSERT INTO public.project_credential_audit_logs (credential_id, actor_id, action)
  VALUES (p_credential_id, p_actor_id, 'COPIED');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: Rotate Credential
CREATE OR REPLACE FUNCTION public.rotate_project_credential(
  p_credential_id UUID,
  p_new_secret_reference TEXT,
  p_new_expires_at TIMESTAMPTZ,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
  v_has_permission BOOLEAN;
BEGIN
  -- Check permission
  SELECT EXISTS (
    SELECT 1 FROM public.project_credential_permissions pcp
    JOIN public.user_roles ur ON ur.role_id = pcp.role_id
    WHERE pcp.credential_id = p_credential_id
      AND ur.user_id = p_actor_id
      AND pcp.permission_type = 'MANAGE_CREDENTIAL'
  ) INTO v_has_permission;

  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'Unauthorized: MANAGE_CREDENTIAL permission required';
  END IF;

  SELECT * INTO v_cred FROM public.project_credentials WHERE id = p_credential_id;

  -- Update version, rotate reference
  UPDATE public.project_credentials
  SET secret_reference = p_new_secret_reference,
      version = version + 1,
      last_rotated_at = NOW(),
      expires_at = COALESCE(p_new_expires_at, expires_at),
      updated_at = NOW()
  WHERE id = p_credential_id;

  -- Append to Activity Projection
  INSERT INTO public.project_activity_projection (
    project_id, actor_id, event_type, payload
  ) VALUES (
    v_cred.project_id, p_actor_id, 'CREDENTIAL_ROTATED',
    jsonb_build_object('credential_id', p_credential_id, 'name', v_cred.name, 'new_version', v_cred.version + 1)
  );

  RETURN jsonb_build_object('success', true, 'new_version', v_cred.version + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RPC: Archive Credential
CREATE OR REPLACE FUNCTION public.archive_project_credential(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
  v_has_permission BOOLEAN;
BEGIN
  -- Check permission
  SELECT EXISTS (
    SELECT 1 FROM public.project_credential_permissions pcp
    JOIN public.user_roles ur ON ur.role_id = pcp.role_id
    WHERE pcp.credential_id = p_credential_id
      AND ur.user_id = p_actor_id
      AND pcp.permission_type = 'MANAGE_CREDENTIAL'
  ) INTO v_has_permission;

  IF NOT v_has_permission THEN
    RAISE EXCEPTION 'Unauthorized: MANAGE_CREDENTIAL permission required';
  END IF;

  SELECT * INTO v_cred FROM public.project_credentials WHERE id = p_credential_id;

  UPDATE public.project_credentials
  SET archived_at = NOW(),
      archived_by = p_actor_id,
      updated_at = NOW()
  WHERE id = p_credential_id;

  -- Append to Activity Projection
  INSERT INTO public.project_activity_projection (
    project_id, actor_id, event_type, payload
  ) VALUES (
    v_cred.project_id, p_actor_id, 'CREDENTIAL_ARCHIVED',
    jsonb_build_object('credential_id', p_credential_id, 'name', v_cred.name)
  );

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
