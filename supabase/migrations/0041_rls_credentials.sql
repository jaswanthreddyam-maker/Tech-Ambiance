-- ==============================================================================
-- PHASE C7.5: Credentials Module RLS
-- ==============================================================================
-- Enforces dual-axis authorization for the Credentials module.
-- ==============================================================================

BEGIN;

-- 1. Helper to get the project for a credential
CREATE OR REPLACE FUNCTION public.get_credential_project_id(p_credential_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF p_credential_id IS NULL THEN RETURN NULL; END IF;
  RETURN (SELECT project_id FROM public.project_credentials WHERE id = p_credential_id);
END;
$$;

ALTER FUNCTION public.get_credential_project_id(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.get_credential_project_id(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_credential_project_id(uuid) TO authenticated;

-- 2. Core visibility wrapper for metadata
CREATE OR REPLACE FUNCTION public.credential_visible(p_credential_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_project_id uuid;
  v_visible boolean;
BEGIN
  IF p_credential_id IS NULL THEN RETURN false; END IF;
  
  v_project_id := (SELECT project_id FROM public.project_credentials WHERE id = p_credential_id);
  IF v_project_id IS NULL THEN RETURN false; END IF;
  
  v_visible := public.project_visible(v_project_id);
  IF v_visible IS NULL THEN RETURN false; END IF;
  
  RETURN v_visible;
END;
$$;

ALTER FUNCTION public.credential_visible(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.credential_visible(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.credential_visible(uuid) TO authenticated;

-- 3. Core visibility wrapper for secrets
CREATE OR REPLACE FUNCTION public.credential_secret_visible(p_credential_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_visible boolean;
BEGIN
  IF p_credential_id IS NULL THEN RETURN false; END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.project_credentials WHERE id = p_credential_id AND archived_at IS NULL) THEN
    RETURN false;
  END IF;
  
  v_visible := public.credential_visible(p_credential_id);
  IF v_visible IS NULL THEN RETURN false; END IF;
  
  RETURN v_visible;
END;
$$;

ALTER FUNCTION public.credential_secret_visible(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.credential_secret_visible(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.credential_secret_visible(uuid) TO authenticated;

-- ============================================================================
-- TABLE: project_credentials (Metadata)
-- ============================================================================
CREATE POLICY credential_admin_read ON public.project_credentials
  FOR SELECT TO authenticated USING (public.project_visible(project_id) AND public.has_permission('credentials:read'));

CREATE POLICY credential_admin_insert ON public.project_credentials
  FOR INSERT TO authenticated WITH CHECK (public.project_visible(project_id) AND public.has_permission('credentials:write'));

CREATE POLICY credential_admin_update ON public.project_credentials
  FOR UPDATE TO authenticated USING (public.project_visible(project_id) AND public.has_permission('credentials:write'))
  WITH CHECK (public.project_visible(project_id) AND public.has_permission('credentials:write'));

CREATE POLICY credential_admin_delete ON public.project_credentials
  FOR DELETE TO authenticated USING (public.project_visible(project_id) AND public.has_permission('credentials:delete'));

-- ============================================================================
-- TABLE: project_credential_permissions (Administrative)
-- ============================================================================
CREATE POLICY credential_permission_admin_read ON public.project_credential_permissions
  FOR SELECT TO authenticated USING (public.credential_visible(credential_id) AND public.has_permission('workspace:write'));

CREATE POLICY credential_permission_admin_insert ON public.project_credential_permissions
  FOR INSERT TO authenticated WITH CHECK (public.credential_visible(credential_id) AND public.has_permission('workspace:write'));

CREATE POLICY credential_permission_admin_update ON public.project_credential_permissions
  FOR UPDATE TO authenticated USING (public.credential_visible(credential_id) AND public.has_permission('workspace:write'));

CREATE POLICY credential_permission_admin_delete ON public.project_credential_permissions
  FOR DELETE TO authenticated USING (public.credential_visible(credential_id) AND public.has_permission('workspace:write'));

-- ============================================================================
-- TABLE: project_credential_audit_logs (Operational)
-- ============================================================================
CREATE POLICY credential_audit_admin_read ON public.project_credential_audit_logs
  FOR SELECT TO authenticated USING (public.credential_visible(credential_id) AND public.has_permission('system:audit'));

CREATE POLICY credential_audit_admin_insert ON public.project_credential_audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.credential_visible(credential_id) AND public.has_permission('system:audit'));

CREATE POLICY credential_audit_admin_update ON public.project_credential_audit_logs
  FOR UPDATE TO authenticated USING (public.credential_visible(credential_id) AND public.has_permission('system:audit'));

CREATE POLICY credential_audit_admin_delete ON public.project_credential_audit_logs
  FOR DELETE TO authenticated USING (public.credential_visible(credential_id) AND public.has_permission('system:audit'));


-- ============================================================================
-- REWRITE RPCS
-- ============================================================================

-- RPC: Create Credential
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
  -- Check permission
  IF NOT (public.project_visible(p_project_id) AND public.has_permission('credentials:write')) THEN
    RAISE EXCEPTION 'Unauthorized: credentials:write permission required';
  END IF;

  -- Insert Metadata
  INSERT INTO public.project_credentials (
    project_id, name, username, description, tags, environment, category, provider, expires_at
  ) VALUES (
    p_project_id, p_name, p_username, p_description, p_tags, p_environment, p_category, p_provider, p_expires_at
  ) RETURNING id INTO v_credential_id;

  -- Insert Secret
  INSERT INTO public.project_credential_secrets (
    credential_id, secret_reference
  ) VALUES (
    v_credential_id, p_secret_reference
  );

  -- Legacy fallback: auto-assign permissions to OWNER, ADMIN, DEVELOPER
  FOR v_role_id IN (SELECT id FROM public.roles WHERE name IN ('OWNER', 'ADMIN', 'DEVELOPER')) LOOP
    IF (SELECT name FROM public.roles WHERE id = v_role_id) IN ('OWNER', 'ADMIN') THEN
      INSERT INTO public.project_credential_permissions (credential_id, role_id, permission_type, assigned_by)
      VALUES 
        (v_credential_id, v_role_id, 'VIEW_METADATA', p_actor_id),
        (v_credential_id, v_role_id, 'REVEAL_SECRET', p_actor_id),
        (v_credential_id, v_role_id, 'MANAGE_CREDENTIAL', p_actor_id);
    ELSE
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.create_project_credential(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.create_project_credential(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.create_project_credential(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, UUID) TO authenticated;


-- RPC: Reveal Credential Secret
CREATE OR REPLACE FUNCTION public.reveal_project_credential(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
  v_secret RECORD;
BEGIN
  -- Check permission using new abstraction
  IF NOT (public.credential_secret_visible(p_credential_id) AND public.has_permission('credentials:decrypt')) THEN
    RAISE EXCEPTION 'Unauthorized: credentials:decrypt permission required';
  END IF;

  SELECT * INTO v_cred FROM public.project_credentials WHERE id = p_credential_id AND archived_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credential not found or archived';
  END IF;

  SELECT * INTO v_secret FROM public.project_credential_secrets WHERE credential_id = p_credential_id;

  -- Log to isolated Audit Table
  INSERT INTO public.project_credential_audit_logs (credential_id, actor_id, action)
  VALUES (p_credential_id, p_actor_id, 'VIEWED');

  -- Update last_viewed_at/by metadata
  UPDATE public.project_credentials
  SET last_viewed_at = NOW(), last_viewed_by = p_actor_id
  WHERE id = p_credential_id;

  RETURN jsonb_build_object(
    'success', true, 
    'secret_value', 'SIMULATED_DECRYPTED_SECRET_' || v_secret.secret_reference,
    'reveal_token_expires_in', 30
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.reveal_project_credential(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.reveal_project_credential(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.reveal_project_credential(UUID, UUID) TO authenticated;


-- RPC: Record Credential Copied
CREATE OR REPLACE FUNCTION public.record_credential_copied(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
BEGIN
  -- Anyone who can decrypt should be able to copy, but to log it they need at least read
  IF NOT (public.credential_secret_visible(p_credential_id) AND public.has_permission('credentials:decrypt')) THEN
    RAISE EXCEPTION 'Unauthorized: credentials:decrypt permission required';
  END IF;

  -- Log to isolated Audit Table
  INSERT INTO public.project_credential_audit_logs (credential_id, actor_id, action)
  VALUES (p_credential_id, p_actor_id, 'COPIED');

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.record_credential_copied(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.record_credential_copied(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.record_credential_copied(UUID, UUID) TO authenticated;


-- RPC: Rotate Credential
CREATE OR REPLACE FUNCTION public.rotate_project_credential(
  p_credential_id UUID,
  p_new_secret_reference TEXT,
  p_new_expires_at TIMESTAMPTZ,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
  v_secret RECORD;
BEGIN
  -- Check permission
  IF NOT (public.credential_secret_visible(p_credential_id) AND public.has_permission('credentials:rotate')) THEN
    RAISE EXCEPTION 'Unauthorized: credentials:rotate permission required';
  END IF;

  SELECT * INTO v_cred FROM public.project_credentials WHERE id = p_credential_id;
  SELECT * INTO v_secret FROM public.project_credential_secrets WHERE credential_id = p_credential_id;

  -- Update version, rotate reference
  UPDATE public.project_credential_secrets
  SET secret_reference = p_new_secret_reference,
      version = version + 1,
      updated_at = NOW()
  WHERE credential_id = p_credential_id;

  UPDATE public.project_credentials
  SET version = v_secret.version + 1,
      last_rotated_at = NOW(),
      expires_at = COALESCE(p_new_expires_at, expires_at),
      updated_at = NOW()
  WHERE id = p_credential_id;

  -- Append to Activity Projection
  INSERT INTO public.project_activity_projection (
    project_id, actor_id, event_type, payload
  ) VALUES (
    v_cred.project_id, p_actor_id, 'CREDENTIAL_ROTATED',
    jsonb_build_object('credential_id', p_credential_id, 'name', v_cred.name, 'new_version', v_secret.version + 1)
  );

  RETURN jsonb_build_object('success', true, 'new_version', v_secret.version + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.rotate_project_credential(UUID, TEXT, TIMESTAMPTZ, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.rotate_project_credential(UUID, TEXT, TIMESTAMPTZ, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.rotate_project_credential(UUID, TEXT, TIMESTAMPTZ, UUID) TO authenticated;


-- RPC: Archive Credential
CREATE OR REPLACE FUNCTION public.archive_project_credential(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
BEGIN
  -- Check permission (deleting/archiving requires delete)
  IF NOT (public.credential_visible(p_credential_id) AND public.has_permission('credentials:delete')) THEN
    RAISE EXCEPTION 'Unauthorized: credentials:delete permission required';
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

  RETURN jsonb_build_object('success', true, 'archived_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

ALTER FUNCTION public.archive_project_credential(UUID, UUID) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.archive_project_credential(UUID, UUID) FROM public;
GRANT EXECUTE ON FUNCTION public.archive_project_credential(UUID, UUID) TO authenticated;

COMMIT;
