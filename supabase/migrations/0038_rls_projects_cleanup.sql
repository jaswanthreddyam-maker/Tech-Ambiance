-- ==============================================================================
-- PHASE C7.4: Projects Module RLS Cleanup
-- ==============================================================================
-- Removes legacy IAM-based and client-based RLS policies for project tables.
-- Must be deployed ONLY after 0037 additive policies have passed verification.
-- ==============================================================================

BEGIN;

DO $$ 
DECLARE
  dropped_count integer := 0;
BEGIN
  -- 1. Table: projects
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Clients can SELECT projects in their workspaces') THEN
    DROP POLICY "Clients can SELECT projects in their workspaces" ON public.projects;
    dropped_count := dropped_count + 1;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Clients can UPDATE projects in their workspaces') THEN
    DROP POLICY "Clients can UPDATE projects in their workspaces" ON public.projects;
    dropped_count := dropped_count + 1;
  END IF;

  -- 2. Table: milestones
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'milestones' AND policyname = 'Clients can SELECT milestones in their projects') THEN
    DROP POLICY "Clients can SELECT milestones in their projects" ON public.milestones;
    dropped_count := dropped_count + 1;
  END IF;

  -- 3. Table: deliverable_files
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'deliverable_files' AND policyname = 'Clients can SELECT deliverable files in their projects') THEN
    DROP POLICY "Clients can SELECT deliverable files in their projects" ON public.deliverable_files;
    dropped_count := dropped_count + 1;
  END IF;

  -- 4. Table: timeline_events
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'timeline_events' AND policyname = 'Clients can SELECT CLIENT timeline events in their projects') THEN
    DROP POLICY "Clients can SELECT CLIENT timeline events in their projects" ON public.timeline_events;
    dropped_count := dropped_count + 1;
  END IF;

  -- 5. Table: client_journey_events
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'client_journey_events' AND policyname = 'Clients can SELECT journey events in their organizations') THEN
    DROP POLICY "Clients can SELECT journey events in their organizations" ON public.client_journey_events;
    dropped_count := dropped_count + 1;
  END IF;

  RAISE NOTICE 'Found % legacy project policies to drop.', dropped_count;
END $$;

COMMIT;
