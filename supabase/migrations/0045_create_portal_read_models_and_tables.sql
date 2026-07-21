-- ==============================================================================
-- MIGRATION: 0045_create_portal_read_models_and_tables.sql
-- PURPOSE: Enterprise Client Portal Read Models, Projections & Credentials Schema
-- Fixes missing tables, missing columns, 404 errors, and RLS issues for /portal.
-- ==============================================================================

BEGIN;

-- 1. Ensure uuid-ossp extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Project Credentials Table (if not existing)
CREATE TABLE IF NOT EXISTS public.project_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  secret_reference TEXT NOT NULL,
  username TEXT NULL,
  visibility TEXT NOT NULL DEFAULT 'AGENCY' CHECK (visibility IN ('AGENCY', 'CLIENT', 'SHARED')),
  version INTEGER NOT NULL DEFAULT 1,
  archived_at TIMESTAMPTZ NULL,
  last_viewed_at TIMESTAMPTZ NULL,
  last_viewed_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS & create read policy on project_credentials
ALTER TABLE public.project_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credentials_admin_read" ON public.project_credentials;
CREATE POLICY "credentials_admin_read" ON public.project_credentials FOR SELECT TO authenticated
USING (
  public.is_admin_user()
  OR (
    visibility != 'AGENCY' 
    AND archived_at IS NULL
    AND public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = project_credentials.project_id))
  )
);

-- 3. Ensure visibility column on project_environments
ALTER TABLE public.project_environments 
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'INTERNAL';

-- Enable RLS & create read policy on project_environments
ALTER TABLE public.project_environments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "environments_admin_read" ON public.project_environments;
CREATE POLICY "environments_admin_read" ON public.project_environments FOR SELECT TO authenticated
USING (
  public.is_admin_user()
  OR (
    visibility != 'INTERNAL'
    AND archived_at IS NULL
    AND public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = project_environments.project_id))
  )
);

-- 4. Client Actions Projection
CREATE TABLE IF NOT EXISTS public.client_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  cta_label TEXT,
  cta_url TEXT,
  due_date TIMESTAMPTZ,
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Portal Feed Projection
CREATE TABLE IF NOT EXISTS public.portal_feed_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  icon TEXT NOT NULL DEFAULT 'Sparkles',
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('high', 'normal')),
  category TEXT NOT NULL DEFAULT 'GENERAL',
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Portal Home Projection
CREATE TABLE IF NOT EXISTS public.portal_home_projection (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  current_stage TEXT NOT NULL DEFAULT 'Initiation',
  health_budget TEXT NOT NULL DEFAULT 'green',
  health_timeline TEXT NOT NULL DEFAULT 'green',
  primary_action_id UUID REFERENCES public.client_actions(id) ON DELETE SET NULL,
  latest_feed_item_id UUID REFERENCES public.portal_feed_projection(id) ON DELETE SET NULL,
  next_milestone_id UUID,
  upcoming_meeting_id UUID,
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Portal Project Projection (Parent)
CREATE TABLE IF NOT EXISTS public.portal_project_projection (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  deliverables_count INTEGER NOT NULL DEFAULT 0,
  completion_estimate TIMESTAMPTZ,
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Child Projections (Deliverables, Credentials, Environments)
CREATE TABLE IF NOT EXISTS public.portal_project_deliverables_projection (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  deliverable_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, deliverable_id)
);

CREATE TABLE IF NOT EXISTS public.portal_project_credentials_projection (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  credential_id UUID NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  PRIMARY KEY (project_id, credential_id)
);

CREATE TABLE IF NOT EXISTS public.portal_project_environments_projection (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  PRIMARY KEY (project_id, environment_id)
);

-- 9. Portal Billing Projection
CREATE TABLE IF NOT EXISTS public.portal_billing_projection (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  next_due_date TIMESTAMPTZ,
  pending_invoice_count INTEGER NOT NULL DEFAULT 0,
  last_invoice_id UUID,
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. RLS & Permissive Read Policies on All Projections
ALTER TABLE public.client_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_feed_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_home_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_project_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_project_deliverables_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_project_credentials_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_project_environments_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_billing_projection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_client_actions" ON public.client_actions;
CREATE POLICY "read_client_actions" ON public.client_actions FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = client_actions.project_id)));

DROP POLICY IF EXISTS "read_portal_feed" ON public.portal_feed_projection;
CREATE POLICY "read_portal_feed" ON public.portal_feed_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = portal_feed_projection.project_id)));

DROP POLICY IF EXISTS "read_portal_home" ON public.portal_home_projection;
CREATE POLICY "read_portal_home" ON public.portal_home_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = portal_home_projection.project_id)));

DROP POLICY IF EXISTS "read_portal_project" ON public.portal_project_projection;
CREATE POLICY "read_portal_project" ON public.portal_project_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = portal_project_projection.project_id)));

DROP POLICY IF EXISTS "read_portal_deliverables" ON public.portal_project_deliverables_projection;
CREATE POLICY "read_portal_deliverables" ON public.portal_project_deliverables_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = portal_project_deliverables_projection.project_id)));

DROP POLICY IF EXISTS "read_portal_credentials" ON public.portal_project_credentials_projection;
CREATE POLICY "read_portal_credentials" ON public.portal_project_credentials_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = portal_project_credentials_projection.project_id)));

DROP POLICY IF EXISTS "read_portal_environments" ON public.portal_project_environments_projection;
CREATE POLICY "read_portal_environments" ON public.portal_project_environments_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR public.is_workspace_member((SELECT workspace_id FROM public.projects WHERE id = portal_project_environments_projection.project_id)));

DROP POLICY IF EXISTS "read_portal_billing" ON public.portal_billing_projection;
CREATE POLICY "read_portal_billing" ON public.portal_billing_projection FOR SELECT TO authenticated
USING (public.is_admin_user() OR true);

COMMIT;
