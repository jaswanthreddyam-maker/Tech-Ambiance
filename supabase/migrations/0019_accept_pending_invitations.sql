-- RPC to accept pending invitations for the authenticated user
CREATE OR REPLACE FUNCTION public.accept_pending_invitations()
RETURNS VOID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_email TEXT;
  v_invite_record RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;

  FOR v_invite_record IN 
    SELECT * FROM public.invitations 
    WHERE email = v_email AND status IN ('PENDING', 'SENT') AND expires_at > NOW()
  LOOP
    -- Join Existing Organization
    INSERT INTO public.organization_members (organization_id, user_id, is_default)
    VALUES (v_invite_record.organization_id, v_user_id, true)
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- Assign invited Role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (v_user_id, v_invite_record.role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Update active organization on Profile
    UPDATE public.profiles
    SET active_organization_id = v_invite_record.organization_id
    WHERE id = v_user_id;

    -- Update invitation status
    UPDATE public.invitations 
    SET status = 'ACCEPTED' 
    WHERE id = v_invite_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
