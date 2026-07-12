-- ==============================================================================
-- MIGRATION: 0011_portal_visibility.sql
-- PURPOSE: Refine visibility of credentials and environments for Client Portal
-- ==============================================================================

BEGIN;

-- 1. Add visibility to project_credentials
ALTER TABLE public.project_credentials
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'AGENCY' 
CHECK (visibility IN ('AGENCY', 'CLIENT', 'SHARED'));

-- 2. Add visibility to project_environments
ALTER TABLE public.project_environments
ADD COLUMN visibility TEXT NOT NULL DEFAULT 'INTERNAL'
CHECK (visibility IN ('PUBLIC', 'CLIENT', 'INTERNAL'));

-- 3. Update reveal_project_credential to enforce credential visibility
CREATE OR REPLACE FUNCTION public.reveal_project_credential(
  p_credential_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_cred RECORD;
  v_is_admin BOOLEAN;
  v_is_client BOOLEAN;
BEGIN
  -- Check if actor is an Admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = p_actor_id
  ) INTO v_is_admin;

  -- Check if actor is a Client (workspace member)
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    JOIN public.projects p ON p.workspace_id = wm.workspace_id
    JOIN public.project_credentials c ON c.project_id = p.id
    WHERE wm.user_id = p_actor_id AND c.id = p_credential_id
  ) INTO v_is_client;

  IF NOT v_is_admin AND NOT v_is_client THEN
    RAISE EXCEPTION 'Unauthorized: REVEAL_SECRET permission required';
  END IF;

  SELECT * INTO v_cred FROM public.project_credentials WHERE id = p_credential_id AND archived_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credential not found or archived';
  END IF;

  -- Enforce Visibility Rule: Clients cannot reveal AGENCY credentials
  IF NOT v_is_admin AND v_cred.visibility = 'AGENCY' THEN
    RAISE EXCEPTION 'Unauthorized: This is an Agency-owned credential';
  END IF;

  -- Log to isolated Audit Table
  INSERT INTO public.project_credential_audit_logs (credential_id, actor_id, action)
  VALUES (p_credential_id, p_actor_id, 'VIEWED');

  -- Update last_viewed_at/by metadata
  UPDATE public.project_credentials
  SET last_viewed_at = NOW(), last_viewed_by = p_actor_id
  WHERE id = p_credential_id;

  RETURN jsonb_build_object(
    'success', true, 
    'secret_value', 'SIMULATED_DECRYPTED_SECRET_' || v_cred.secret_reference,
    'reveal_token_expires_in', 30
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
