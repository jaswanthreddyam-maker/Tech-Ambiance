-- ==============================================================================
-- Migration 0018: Studio Team CQRS Projections
-- ==============================================================================

-- 1. rpc_studio_team_members_projection
CREATE OR REPLACE FUNCTION rpc_studio_team_members_projection(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 10,
  p_search TEXT DEFAULT NULL,
  p_role TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := auth.uid();
  v_total INT;
  v_items JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT active_organization_id INTO v_org_id 
  FROM public.profiles 
  WHERE id = v_user_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No active organization';
  END IF;

  -- Create a temporary table or CTE to handle the complex query
  WITH matched_members AS (
    SELECT 
      p.id,
      p.full_name,
      p.email,
      p.is_suspended,
      p.last_login,
      om.joined_at,
      ARRAY_AGG(r.name) as roles
    FROM public.organization_members om
    JOIN public.profiles p ON om.user_id = p.id
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    LEFT JOIN public.roles r ON ur.role_id = r.id
    WHERE om.organization_id = v_org_id
    GROUP BY p.id, p.full_name, p.email, p.is_suspended, p.last_login, om.joined_at
  ),
  filtered_members AS (
    SELECT *
    FROM matched_members m
    WHERE 
      (p_search IS NULL OR 
       m.full_name ILIKE '%' || p_search || '%' OR 
       m.email ILIKE '%' || p_search || '%' OR
       EXISTS (SELECT 1 FROM unnest(m.roles) r WHERE r ILIKE '%' || p_search || '%')
      )
      AND (p_role IS NULL OR p_role = ANY(m.roles))
      AND (
        p_status IS NULL OR 
        (p_status = 'ACTIVE' AND m.is_suspended = false) OR 
        (p_status = 'SUSPENDED' AND m.is_suspended = true)
      )
  ),
  counted AS (
    SELECT COUNT(*) as total_count FROM filtered_members
  ),
  paginated AS (
    SELECT * FROM filtered_members
    ORDER BY joined_at DESC
    LIMIT p_page_size
    OFFSET (p_page - 1) * p_page_size
  )
  SELECT 
    COALESCE(JSONB_AGG(row_to_json(paginated)), '[]'::jsonb),
    (SELECT total_count FROM counted)
  INTO v_items, v_total
  FROM paginated;

  RETURN jsonb_build_object(
    'projection_version', 1,
    'last_projected_at', NOW(),
    'items', COALESCE(v_items, '[]'::jsonb),
    'total', COALESCE(v_total, 0),
    'page', p_page,
    'page_size', p_page_size,
    'total_pages', CEIL(COALESCE(v_total, 0)::numeric / p_page_size)
  );
END;
$$ LANGUAGE plpgsql;


-- 2. rpc_studio_team_invitations_projection
CREATE OR REPLACE FUNCTION rpc_studio_team_invitations_projection(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 10,
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := auth.uid();
  v_total INT;
  v_items JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT active_organization_id INTO v_org_id 
  FROM public.profiles 
  WHERE id = v_user_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'No active organization';
  END IF;

  WITH matched_invitations AS (
    SELECT 
      i.id,
      i.email,
      i.status,
      i.expires_at,
      i.created_at,
      r.name as role
    FROM public.invitations i
    JOIN public.roles r ON i.role_id = r.id
    WHERE i.organization_id = v_org_id
  ),
  filtered_invitations AS (
    SELECT *
    FROM matched_invitations m
    WHERE 
      (p_search IS NULL OR m.email ILIKE '%' || p_search || '%')
      AND (p_status IS NULL OR m.status = p_status)
  ),
  counted AS (
    SELECT COUNT(*) as total_count FROM filtered_invitations
  ),
  paginated AS (
    SELECT * FROM filtered_invitations
    ORDER BY created_at DESC
    LIMIT p_page_size
    OFFSET (p_page - 1) * p_page_size
  )
  SELECT 
    COALESCE(JSONB_AGG(row_to_json(paginated)), '[]'::jsonb),
    (SELECT total_count FROM counted)
  INTO v_items, v_total
  FROM paginated;

  RETURN jsonb_build_object(
    'projection_version', 1,
    'last_projected_at', NOW(),
    'items', COALESCE(v_items, '[]'::jsonb),
    'total', COALESCE(v_total, 0),
    'page', p_page,
    'page_size', p_page_size,
    'total_pages', CEIL(COALESCE(v_total, 0)::numeric / p_page_size)
  );
END;
$$ LANGUAGE plpgsql;
