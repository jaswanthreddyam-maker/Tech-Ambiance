-- ==============================================================================
-- MIGRATION: 0008_fix_rls.sql
-- PURPOSE: Fix missing RLS policies on user_roles and permissions tables
-- ==============================================================================

BEGIN;

-- 1. Allow users to read their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- 2. Allow users to read permissions that apply to their roles
CREATE POLICY "Users can view permissions for their roles"
  ON public.project_credential_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.role_id = public.project_credential_permissions.role_id
        AND ur.user_id = auth.uid()
    )
  );

COMMIT;
