-- ==============================================================================
-- TECH AMBIANCE STUDIOHQ: EXPLICIT OWNER PERMISSIONS FOR JASWANTH REDDY
-- ==============================================================================

-- 1. Ensure jaswanthreddyam@gmail.com is active OWNER in admin_users
INSERT INTO public.admin_users (email, role, is_active)
VALUES ('jaswanthreddyam@gmail.com', 'OWNER', true)
ON CONFLICT (email) DO UPDATE
SET role = 'OWNER',
    is_active = true;

-- 2. Grant OWNER role in user_roles for any existing profile matching jaswanthreddyam@gmail.com
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'OWNER';

  FOR v_user_id IN
    SELECT id FROM public.profiles WHERE LOWER(email) = 'jaswanthreddyam@gmail.com'
  LOOP
    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (v_user_id, v_role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
