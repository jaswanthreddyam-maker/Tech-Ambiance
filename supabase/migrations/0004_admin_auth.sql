-- ==============================================================================
-- TECH AMBIANCE AGENCY OPERATING SYSTEM: ADMIN AUTHENTICATION
-- ==============================================================================

-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Admins
INSERT INTO public.admin_users (email, role) VALUES
  ('jaswanthreddyam@gmail.com', 'OWNER'),
  ('jeshu0069@gmail.com', 'OWNER')
ON CONFLICT (email) DO NOTHING;

-- 2. Admin Sessions Metadata
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- references auth.sessions but we keep it loose for resilience
  browser TEXT NULL,
  os TEXT NULL,
  ip_address TEXT NULL,
  country TEXT NULL,
  is_trusted BOOLEAN NOT NULL DEFAULT false,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Rate Limiting for OTP
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NULL,
  attempt_type TEXT NOT NULL, -- 'OTP_REQUEST' or 'OTP_VERIFY_FAIL'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC for Rate Limiting Check (Security Definer)
CREATE OR REPLACE FUNCTION check_auth_rate_limit(p_email TEXT, p_ip TEXT, p_type TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  IF p_type = 'OTP_REQUEST' THEN
    -- Max 5 requests per 15 minutes
    SELECT COUNT(*) INTO recent_count
    FROM public.auth_rate_limits
    WHERE email = p_email AND attempt_type = 'OTP_REQUEST'
      AND created_at > (NOW() - INTERVAL '15 minutes');
      
    IF recent_count >= 5 THEN
      RETURN FALSE;
    END IF;
  ELSIF p_type = 'OTP_VERIFY_FAIL' THEN
    -- Max 10 fails per 15 minutes
    SELECT COUNT(*) INTO recent_count
    FROM public.auth_rate_limits
    WHERE email = p_email AND attempt_type = 'OTP_VERIFY_FAIL'
      AND created_at > (NOW() - INTERVAL '15 minutes');
      
    IF recent_count >= 10 THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- RPC to record a rate limit event
CREATE OR REPLACE FUNCTION record_auth_rate_limit(p_email TEXT, p_ip TEXT, p_type TEXT)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.auth_rate_limits (email, ip_address, attempt_type)
  VALUES (p_email, p_ip, p_type);
END;
$$ LANGUAGE plpgsql;

-- 4. RPC: Verify Admin Authorization Post-OTP
CREATE OR REPLACE FUNCTION verify_admin_authorization(p_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
  v_user_id UUID;
BEGIN
  -- We assume auth.uid() is now set because Supabase verified the OTP
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if email exists in admin_users and is active
  SELECT id INTO v_admin_id
  FROM public.admin_users
  WHERE email = p_email AND is_active = true;

  IF v_admin_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Link user_id if it's the first time
  UPDATE public.admin_users
  SET user_id = v_user_id
  WHERE id = v_admin_id AND user_id IS NULL;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. RPC: Register Session Metadata
CREATE OR REPLACE FUNCTION register_admin_session(
  p_email TEXT,
  p_session_id UUID,
  p_browser TEXT,
  p_os TEXT,
  p_ip TEXT,
  p_country TEXT,
  p_is_trusted BOOLEAN
)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id
  FROM public.admin_users
  WHERE email = p_email;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.admin_sessions (admin_id, session_id, browser, os, ip_address, country, is_trusted)
    VALUES (v_admin_id, p_session_id, p_browser, p_os, p_ip, p_country, p_is_trusted);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. RPC: Log Admin Audit Event
CREATE OR REPLACE FUNCTION log_admin_auth_event(
  p_email TEXT,
  p_action TEXT, -- 'AdminSignedIn', 'AdminSignedOut', 'OtpRequested', 'OtpVerified', 'UnauthorizedAttempt'
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  INSERT INTO public.admin_audit_logs (actor_user_id, action_type, target_entity_type, target_entity_id, new_state)
  VALUES (
    COALESCE(v_user_id, '00000000-0000-0000-0000-000000000000'::UUID), -- Default if no auth
    p_action,
    'Auth',
    COALESCE(v_user_id, '00000000-0000-0000-0000-000000000000'::UUID),
    p_details || jsonb_build_object('email', p_email)
  );
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own record" ON public.admin_users FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view their sessions" ON public.admin_sessions FOR SELECT USING (
  admin_id IN (SELECT id FROM public.admin_users WHERE user_id = auth.uid())
);

-- Public functions grants
GRANT EXECUTE ON FUNCTION check_auth_rate_limit(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_auth_rate_limit(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_authorization(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION register_admin_session(TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_auth_event(TEXT, TEXT, JSONB) TO anon, authenticated;
