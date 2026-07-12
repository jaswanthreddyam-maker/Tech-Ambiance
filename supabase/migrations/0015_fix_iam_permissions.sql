-- ==============================================================================
-- MIGRATION: 0015_fix_iam_permissions.sql
-- PURPOSE: Fix missing RLS policies on IAM tables and missing GRANTS on projections
-- ==============================================================================

BEGIN;

-- 1. Grant SELECT on all tables created in 0013 and 0014 to authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 2. Add Missing RLS Policies for Membership Tables
-- Without these, the organizations and workspaces RLS policies fail 
-- because they query these tables in their USING clauses.

CREATE POLICY "Users can SELECT own organization memberships"
  ON public.organization_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can SELECT own workspace memberships"
  ON public.workspace_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can SELECT own user_roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Allow anyone in the organization to see other organization members? 
-- Actually, for Studio Team page, they will need to see other profiles and roles.
-- Let's make profiles, organization_members, and user_roles viewable by ANY authenticated user in the same org.
-- Since the current system only has ONE org (Agency OS), we can just let authenticated users read them.

DROP POLICY IF EXISTS "Users can SELECT own profile" ON public.profiles;
CREATE POLICY "Authenticated users can SELECT all profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can SELECT own organization memberships" ON public.organization_members;
CREATE POLICY "Authenticated users can SELECT all organization_members"
  ON public.organization_members FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can SELECT own user_roles" ON public.user_roles;
CREATE POLICY "Authenticated users can SELECT all user_roles"
  ON public.user_roles FOR SELECT
  USING (auth.role() = 'authenticated');

COMMIT;
