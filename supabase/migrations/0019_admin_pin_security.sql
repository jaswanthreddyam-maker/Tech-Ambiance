-- ==============================================================================
-- Migration 0019: Executive Authentication (Zero-Trust PIN) Security Schema
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure domain_events_outbox exists
CREATE TABLE IF NOT EXISTS public.domain_events_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ NULL,
  last_error TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. admin_security table
CREATE TABLE IF NOT EXISTS public.admin_security (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  failed_attempts INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. admin_pin_history table
CREATE TABLE IF NOT EXISTS public.admin_pin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. executive_sessions table
CREATE TABLE IF NOT EXISTS public.executive_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  device_fingerprint TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  absolute_expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL,
  revoked_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  revocation_reason TEXT NULL
);

-- RLS Configuration
ALTER TABLE public.admin_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_pin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_sessions ENABLE ROW LEVEL SECURITY;

-- No direct access for clients for modification, but users can SELECT their own record to check if PIN exists.
DROP POLICY IF EXISTS "Users can view their own security record" ON public.admin_security;
CREATE POLICY "Users can view their own security record"
ON public.admin_security FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- However, we can allow users to read their own active sessions for a dashboard later.
DROP POLICY IF EXISTS "Users can view their own executive sessions" ON public.executive_sessions;
CREATE POLICY "Users can view their own executive sessions"
  ON public.executive_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- ==============================================================================
-- RPCs
-- ==============================================================================

-- rpc_create_admin_pin
-- Creates the initial PIN if it doesn't exist.
CREATE OR REPLACE FUNCTION rpc_create_admin_pin(p_pin TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_hash TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate complexity
  IF p_pin IN ('000000', '111111', '222222', '333333', '444444', '555555', '666666', '777777', '888888', '999999', '123456', '654321', '121212') THEN
    RAISE EXCEPTION 'RULE-AUTH-ADMIN-006: PIN is too weak.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_security WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'PIN already setup for this user.';
  END IF;

  -- Self-heal: ensure profile exists before inserting admin_security FK
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (v_user_id, COALESCE(auth.jwt()->>'email', 'admin@studiohq.com'), 'Executive Admin')
  ON CONFLICT (id) DO NOTHING;

  v_hash := crypt(p_pin, gen_salt('bf'));

  INSERT INTO public.admin_security (user_id, pin_hash)
  VALUES (v_user_id, v_hash);

  INSERT INTO public.admin_pin_history (user_id, pin_hash)
  VALUES (v_user_id, v_hash);

  -- Emit Event
  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('AdminSecurity', v_user_id, 'AdminPinCreated', jsonb_build_object('user_id', v_user_id));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- rpc_verify_admin_pin
-- Validates PIN and handles lockouts. Returns TRUE if valid, FALSE otherwise.
CREATE OR REPLACE FUNCTION rpc_verify_admin_pin(p_pin TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_security public.admin_security%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_security FROM public.admin_security WHERE user_id = v_user_id;

  IF v_security.user_id IS NULL THEN
    RAISE EXCEPTION 'Admin security record not found.';
  END IF;

  IF v_security.locked_until IS NOT NULL AND v_security.locked_until > NOW() THEN
    RAISE EXCEPTION 'Account is locked due to multiple failed attempts.';
  END IF;

  IF v_security.pin_hash = crypt(p_pin, v_security.pin_hash) THEN
    -- Success
    UPDATE public.admin_security 
    SET failed_attempts = 0, locked_until = NULL, updated_at = NOW() 
    WHERE user_id = v_user_id;

    INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
    VALUES ('AdminSecurity', v_user_id, 'AdminPinVerified', jsonb_build_object('user_id', v_user_id));

    RETURN TRUE;
  ELSE
    -- Failure
    UPDATE public.admin_security 
    SET 
      failed_attempts = failed_attempts + 1,
      locked_until = CASE WHEN failed_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE locked_until END,
      updated_at = NOW()
    WHERE user_id = v_user_id;

    INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
    VALUES ('AdminSecurity', v_user_id, 'AdminPinFailed', jsonb_build_object('user_id', v_user_id));

    IF v_security.failed_attempts + 1 >= 5 THEN
      INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
      VALUES ('AdminSecurity', v_user_id, 'AdminLocked', jsonb_build_object('user_id', v_user_id));
      
      INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
      VALUES ('AdminSecurity', v_user_id, 'SecurityIncidentRaised', jsonb_build_object('user_id', v_user_id, 'reason', 'PIN Brute Force'));
    END IF;

    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;


-- rpc_create_executive_session
-- Creates a new session returning the UUID.
CREATE OR REPLACE FUNCTION rpc_create_executive_session(p_metadata JSONB)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_session_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.executive_sessions (
    user_id, 
    ip_address, 
    user_agent, 
    device_fingerprint, 
    expires_at, 
    absolute_expires_at
  ) VALUES (
    v_user_id,
    p_metadata->>'ip_address',
    p_metadata->>'user_agent',
    p_metadata->>'device_fingerprint',
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '8 hours'
  ) RETURNING id INTO v_session_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('AdminSecurity', v_user_id, 'ExecutiveSessionCreated', jsonb_build_object('user_id', v_user_id, 'session_id', v_session_id));

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;


-- rpc_validate_executive_session
CREATE OR REPLACE FUNCTION rpc_validate_executive_session(p_session_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_session public.executive_sessions%ROWTYPE;
  v_is_suspended BOOLEAN;
BEGIN
  SELECT * INTO v_session FROM public.executive_sessions WHERE id = p_session_id;

  IF v_session.id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_session.revoked_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  IF NOW() > v_session.expires_at OR NOW() > v_session.absolute_expires_at THEN
    RETURN FALSE;
  END IF;

  -- Verify user suspension rule (RULE-AUTH-ADMIN-002)
  SELECT is_suspended INTO v_is_suspended FROM public.profiles WHERE id = v_session.user_id;
  IF v_is_suspended = TRUE THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- rpc_refresh_executive_session
CREATE OR REPLACE FUNCTION rpc_refresh_executive_session(p_session_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_valid BOOLEAN;
  v_session public.executive_sessions%ROWTYPE;
  v_new_expires_at TIMESTAMPTZ;
BEGIN
  v_valid := rpc_validate_executive_session(p_session_id);
  IF NOT v_valid THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO v_session FROM public.executive_sessions WHERE id = p_session_id;

  v_new_expires_at := LEAST(NOW() + INTERVAL '30 minutes', v_session.absolute_expires_at);

  UPDATE public.executive_sessions 
  SET 
    expires_at = v_new_expires_at, 
    last_activity_at = NOW() 
  WHERE id = p_session_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('AdminSecurity', v_session.user_id, 'ExecutiveSessionRefreshed', jsonb_build_object('session_id', p_session_id));

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- rpc_revoke_executive_session
CREATE OR REPLACE FUNCTION rpc_revoke_executive_session(p_session_id UUID, p_reason TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.executive_sessions
  SET 
    revoked_at = NOW(),
    revocation_reason = p_reason
  WHERE id = p_session_id AND revoked_at IS NULL;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;


-- rpc_revoke_all_executive_sessions
CREATE OR REPLACE FUNCTION rpc_revoke_all_executive_sessions(p_user_id UUID, p_reason TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.executive_sessions
  SET 
    revoked_at = NOW(),
    revocation_reason = p_reason
  WHERE user_id = p_user_id AND revoked_at IS NULL;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
