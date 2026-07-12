-- ==============================================================================
-- Migration 0014: Studio Team Management
-- ==============================================================================

-- 1. Enhance Profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS reactivated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reactivated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- 2. Enhance Invitations
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 3. RULE-AUTH-007: Prevent last OWNER deletion
CREATE OR REPLACE FUNCTION prevent_last_owner_removal()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_count INT;
  v_is_owner BOOLEAN;
BEGIN
  -- Determine if the deleted row was an OWNER role
  SELECT EXISTS (
    SELECT 1 FROM public.roles WHERE id = OLD.role_id AND name = 'OWNER'
  ) INTO v_is_owner;

  IF v_is_owner THEN
    SELECT COUNT(*) INTO v_owner_count 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE r.name = 'OWNER';
    
    -- If count is 1, it means we are deleting the very last one
    IF v_owner_count <= 1 THEN
      RAISE EXCEPTION 'RULE-AUTH-007: Cannot remove the last OWNER.';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_owner_exists ON public.user_roles;
CREATE TRIGGER ensure_owner_exists
BEFORE DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION prevent_last_owner_removal();

-- 4. RULE-AUTH-007: Prevent last OWNER suspension
CREATE OR REPLACE FUNCTION prevent_last_owner_suspension()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_count INT;
  v_is_target_owner BOOLEAN;
BEGIN
  IF NEW.is_suspended = true AND OLD.is_suspended = false THEN
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = NEW.id AND r.name = 'OWNER'
    ) INTO v_is_target_owner;

    IF v_is_target_owner THEN
      SELECT COUNT(*) INTO v_owner_count 
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE r.name = 'OWNER' AND ur.user_id != NEW.id AND (
        SELECT is_suspended FROM public.profiles WHERE id = ur.user_id
      ) = false;
      
      IF v_owner_count = 0 THEN
        RAISE EXCEPTION 'RULE-AUTH-007: Cannot suspend the last active OWNER.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_owner_exists_suspension ON public.profiles;
CREATE TRIGGER ensure_owner_exists_suspension
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_last_owner_suspension();


-- 5. RPC: Create Studio Invitation
CREATE OR REPLACE FUNCTION create_studio_invitation(
  p_email TEXT, 
  p_role_name TEXT, 
  p_org_id UUID
)
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
  v_inviter_id UUID := auth.uid();
  v_role_id UUID;
  v_is_inviter_owner BOOLEAN;
  v_invitation_id UUID;
  v_token TEXT := encode(gen_random_bytes(32), 'hex');
BEGIN
  IF v_inviter_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check inviter suspension
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_inviter_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot create invitations.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = v_inviter_id AND r.name = 'OWNER'
  ) INTO v_is_inviter_owner;

  IF p_role_name = 'OWNER' AND NOT v_is_inviter_owner THEN
    RAISE EXCEPTION 'Only an OWNER can invite another OWNER.';
  END IF;

  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Invalid role specified.';
  END IF;

  INSERT INTO public.invitations (organization_id, email, role_id, token, expires_at, status, invited_by)
  VALUES (p_org_id, p_email, v_role_id, v_token, NOW() + INTERVAL '7 days', 'PENDING', v_inviter_id)
  RETURNING id INTO v_invitation_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES (
    'Invitation', 
    v_invitation_id, 
    'StudioInvitationCreated', 
    jsonb_build_object('email', p_email, 'role', p_role_name, 'org_id', p_org_id, 'token', v_token)
  );

  RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql;


-- 6. RPC: Revoke Studio Invitation
CREATE OR REPLACE FUNCTION revoke_studio_invitation(p_invitation_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_inviter_id UUID := auth.uid();
  v_current_status TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_inviter_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot revoke invitations.';
  END IF;

  SELECT status INTO v_current_status FROM public.invitations WHERE id = p_invitation_id;
  
  IF v_current_status = 'ACCEPTED' THEN
    RAISE EXCEPTION 'Cannot revoke an already ACCEPTED invitation.';
  END IF;

  UPDATE public.invitations 
  SET status = 'REVOKED'
  WHERE id = p_invitation_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('Invitation', p_invitation_id, 'StudioInvitationRevoked', '{}');
END;
$$ LANGUAGE plpgsql;


-- 7. RPC: Resend Studio Invitation
CREATE OR REPLACE FUNCTION resend_studio_invitation(p_invitation_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_inviter_id UUID := auth.uid();
  v_current_status TEXT;
  v_token TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_inviter_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot resend invitations.';
  END IF;

  SELECT status, token INTO v_current_status, v_token FROM public.invitations WHERE id = p_invitation_id;
  
  IF v_current_status = 'ACCEPTED' OR v_current_status = 'REVOKED' THEN
    RAISE EXCEPTION 'Cannot resend a % invitation.', v_current_status;
  END IF;

  UPDATE public.invitations 
  SET expires_at = NOW() + INTERVAL '7 days', status = 'SENT'
  WHERE id = p_invitation_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('Invitation', p_invitation_id, 'StudioInvitationCreated', jsonb_build_object('is_resend', true, 'token', v_token));
END;
$$ LANGUAGE plpgsql;


-- 8. RPC: Assign Role
CREATE OR REPLACE FUNCTION assign_role(p_user_id UUID, p_role_name TEXT)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_role_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot assign roles.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot receive new roles.';
  END IF;

  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  
  INSERT INTO public.user_roles (user_id, role_id, assigned_by)
  VALUES (p_user_id, v_role_id, v_admin_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('User', p_user_id, 'UserRoleAssigned', jsonb_build_object('role', p_role_name, 'assigned_by', v_admin_id));
END;
$$ LANGUAGE plpgsql;


-- 9. RPC: Remove Role
CREATE OR REPLACE FUNCTION remove_role(p_user_id UUID, p_role_name TEXT)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_role_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot remove roles.';
  END IF;

  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  
  DELETE FROM public.user_roles 
  WHERE user_id = p_user_id AND role_id = v_role_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('User', p_user_id, 'UserRoleRemoved', jsonb_build_object('role', p_role_name, 'removed_by', v_admin_id));
END;
$$ LANGUAGE plpgsql;


-- 10. RPC: Suspend User
CREATE OR REPLACE FUNCTION suspend_user_access(p_user_id UUID, p_reason TEXT)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot suspend other users.';
  END IF;

  UPDATE public.profiles
  SET is_suspended = true, suspended_by = v_admin_id, suspended_at = NOW(), suspension_reason = p_reason
  WHERE id = p_user_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('User', p_user_id, 'UserSuspended', jsonb_build_object('reason', p_reason, 'suspended_by', v_admin_id));
END;
$$ LANGUAGE plpgsql;


-- 11. RPC: Reactivate User
CREATE OR REPLACE FUNCTION reactivate_user_access(p_user_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_admin_id AND is_suspended = true) THEN
    RAISE EXCEPTION 'RULE-AUTH-008: Suspended users cannot reactivate other users.';
  END IF;

  UPDATE public.profiles
  SET is_suspended = false, reactivated_by = v_admin_id, reactivated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO public.domain_events_outbox (aggregate_type, aggregate_id, event_type, payload)
  VALUES ('User', p_user_id, 'UserReactivated', jsonb_build_object('reactivated_by', v_admin_id));
END;
$$ LANGUAGE plpgsql;
