-- ==============================================================================
-- MIGRATION: 0006_workspace_management.sql
-- PURPOSE: Enterprise Workspace Management (Environments, Tasks, Activity Feed)
-- ==============================================================================

BEGIN;

-- 1. Add Versioning and Soft Deletes to existing entities
ALTER TABLE public.workspaces 
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

ALTER TABLE public.milestones 
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- 2. Create Project Environments Table
CREATE TABLE IF NOT EXISTS public.project_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'PRODUCTION', 'STAGING', 'QA', 'DEV'
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  version INTEGER NOT NULL DEFAULT 1,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing URL data from projects to environments (if any)
INSERT INTO public.project_environments (project_id, type, url)
SELECT id, 'PRODUCTION', production_environment_url 
FROM public.projects WHERE production_environment_url IS NOT NULL;

INSERT INTO public.project_environments (project_id, type, url)
SELECT id, 'STAGING', staging_environment_url 
FROM public.projects WHERE staging_environment_url IS NOT NULL;

-- Drop deprecated columns from projects
ALTER TABLE public.projects
  DROP COLUMN IF EXISTS production_environment_url,
  DROP COLUMN IF EXISTS staging_environment_url,
  DROP COLUMN IF EXISTS source_code_url;

-- 3. Create Project Deployments Table
CREATE TABLE IF NOT EXISTS public.project_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL REFERENCES public.project_environments(id) ON DELETE CASCADE,
  commit_sha TEXT NOT NULL,
  branch TEXT NOT NULL DEFAULT 'main',
  status TEXT NOT NULL, -- 'Pending', 'In Progress', 'Healthy', 'Failed'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NULL,
  actor_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  deployment_provider TEXT NULL,
  deployment_url TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Project Tasks Table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID NULL REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
  status TEXT NOT NULL DEFAULT 'TODO', -- 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'
  assignee_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimate TEXT NULL,
  labels TEXT[] NULL,
  due_date DATE NULL,
  github_issue TEXT NULL,
  blocked_by_task_id UUID NULL REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  version INTEGER NOT NULL DEFAULT 1,
  archived_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Project Activity Projection (Timeline) Table
CREATE TABLE IF NOT EXISTS public.project_activity_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, 
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_client_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RPC: Business Workflows

-- Create Task Workflow
CREATE OR REPLACE FUNCTION public.create_project_task(
  p_project_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_priority TEXT,
  p_milestone_id UUID,
  p_assignee_id UUID,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_task_id UUID;
BEGIN
  -- Insert Task
  INSERT INTO public.project_tasks (
    project_id, title, description, priority, milestone_id, assignee_id
  ) VALUES (
    p_project_id, p_title, p_description, p_priority, p_milestone_id, p_assignee_id
  ) RETURNING id INTO v_task_id;

  -- Append to Activity Projection
  INSERT INTO public.project_activity_projection (
    project_id, actor_id, event_type, payload
  ) VALUES (
    p_project_id, p_actor_id, 'TASK_CREATED',
    jsonb_build_object('task_id', v_task_id, 'title', p_title, 'priority', p_priority)
  );

  RETURN jsonb_build_object('success', true, 'task_id', v_task_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Task Status Workflow
CREATE OR REPLACE FUNCTION public.update_project_task_status(
  p_task_id UUID,
  p_new_status TEXT,
  p_expected_version INTEGER,
  p_actor_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_task RECORD;
BEGIN
  SELECT * INTO v_task FROM public.project_tasks WHERE id = p_task_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  IF v_task.version != p_expected_version THEN
    RAISE EXCEPTION 'Optimistic concurrency failure: Version mismatch. Expected %, but got %', p_expected_version, v_task.version;
  END IF;

  UPDATE public.project_tasks
  SET status = p_new_status, version = version + 1, updated_at = NOW()
  WHERE id = p_task_id;

  -- Append to Activity Projection
  INSERT INTO public.project_activity_projection (
    project_id, actor_id, event_type, payload
  ) VALUES (
    v_task.project_id, p_actor_id, 'TASK_STATUS_CHANGED',
    jsonb_build_object('task_id', p_task_id, 'title', v_task.title, 'old_status', v_task.status, 'new_status', p_new_status)
  );

  RETURN jsonb_build_object('success', true, 'new_version', v_task.version + 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
