-- ==============================================================================
-- PHASE C7.2: Workspace Module RLS Cleanup
-- ==============================================================================
-- Drops legacy policies for the Workspace Module now that additive policies
-- from 0033 have been verified in production.
-- ==============================================================================

BEGIN;

-- 1. Pre-flight Verification Check
-- Ensure we are only dropping the exact policies we expect.
DO $$ 
DECLARE
    legacy_count INT;
BEGIN
    SELECT count(*) INTO legacy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('organizations', 'workspaces', 'organization_members', 'workspace_members', 'invitations')
      AND policyname IN (
        'Users can view their own organization',
        'Users can view their own workspaces',
        'Users can SELECT member workspaces',
        'Users can view members of their organization',
        'Users can view members of their workspaces',
        'Users can view their own invitations'
      );
    
    -- We don't abort if count is 0 (idempotent), but this block can be extended
    -- to strictly enforce state if desired.
    RAISE NOTICE 'Found % legacy workspace policies to drop.', legacy_count;
END $$;

-- 2. Drop Legacy Policies
-- ==============================================================================

-- Drop legacy policies from 0001_enterprise_saas_auth.sql, 0005_workspaces_engine.sql, etc.
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can SELECT member workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view their own invitations" ON public.invitations;

-- (If there were other legacy policies, they would be added here)

COMMIT;
