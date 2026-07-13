-- 0025_return_invitation_token.sql

DROP FUNCTION IF EXISTS create_studio_invitation(TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION create_studio_invitation(
  p_email TEXT, 
  p_role_name TEXT, 
  p_org_id UUID
)
RETURNS JSONB
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

  RETURN jsonb_build_object('id', v_invitation_id, 'token', v_token);
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
