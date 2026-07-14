-- ==============================================================================
-- PHASE C7.5: Credentials Cleanup
-- ==============================================================================
-- Drops legacy IAM policies on credential tables.
-- ==============================================================================

BEGIN;

DO $$ 
DECLARE
  dropped_count integer := 0;
BEGIN
  -- Table: project_credentials
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_credentials' AND policyname = 'Users can select credential metadata based on permissions') THEN
    DROP POLICY "Users can select credential metadata based on permissions" ON public.project_credentials;
    dropped_count := dropped_count + 1;
  END IF;

  -- Table: project_credential_permissions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_credential_permissions' AND policyname = 'Users can view permissions for their roles') THEN
    DROP POLICY "Users can view permissions for their roles" ON public.project_credential_permissions;
    dropped_count := dropped_count + 1;
  END IF;

  RAISE NOTICE 'Found % legacy credentials policies to drop.', dropped_count;
END $$;

COMMIT;
