-- =============================================================================
-- Migration: 20260721_portal_read_models.sql
-- Description: Creates the projection tables for the Portal CQRS Read Models.
-- =============================================================================

-- 1. Client Actions Projection
CREATE TABLE client_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'dismissed')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  cta_label TEXT,
  cta_url TEXT,
  due_date TIMESTAMPTZ,
  
  -- Projection Metadata
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_actions_project ON client_actions(project_id);

-- 2. Portal Feed Projection
CREATE TABLE portal_feed_projection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'normal')),
  category TEXT NOT NULL,
  
  -- Projection Metadata
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portal_feed_project ON portal_feed_projection(project_id);
CREATE INDEX idx_portal_feed_timestamp ON portal_feed_projection(timestamp DESC);

-- 3. Portal Home Projection
CREATE TABLE portal_home_projection (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  current_stage TEXT NOT NULL DEFAULT 'Initiation',
  health_budget TEXT NOT NULL DEFAULT 'green',
  health_timeline TEXT NOT NULL DEFAULT 'green',
  primary_action_id UUID REFERENCES client_actions(id) ON DELETE SET NULL,
  latest_feed_item_id UUID REFERENCES portal_feed_projection(id) ON DELETE SET NULL,
  next_milestone_id UUID,
  upcoming_meeting_id UUID,
  
  -- Projection Metadata
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Portal Project Projection (Parent)
CREATE TABLE portal_project_projection (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  deliverables_count INTEGER NOT NULL DEFAULT 0,
  completion_estimate TIMESTAMPTZ,
  
  -- Projection Metadata
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4a. Project Child Projections (Collections)
CREATE TABLE portal_project_deliverables_projection (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  deliverable_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, deliverable_id)
);

CREATE TABLE portal_project_credentials_projection (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  credential_id UUID NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  PRIMARY KEY (project_id, credential_id)
);

CREATE TABLE portal_project_environments_projection (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  environment_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL,
  PRIMARY KEY (project_id, environment_id)
);

-- 5. Portal Billing Projection
CREATE TABLE portal_billing_projection (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  outstanding_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  next_due_date TIMESTAMPTZ,
  pending_invoice_count INTEGER NOT NULL DEFAULT 0,
  last_invoice_id UUID,
  
  -- Projection Metadata
  projection_version TEXT NOT NULL DEFAULT '1.0',
  last_event_id UUID,
  last_event_timestamp TIMESTAMPTZ,
  rebuilt_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. RLS Policies
-- Enable RLS
ALTER TABLE client_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_feed_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_home_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_deliverables_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_credentials_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_environments_projection ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_billing_projection ENABLE ROW LEVEL SECURITY;

-- Note: In a real system, you would add actual RLS policies here allowing 
-- users to read projections tied to their projects/organizations.
-- Example:
-- CREATE POLICY "Clients can view their project home projection" ON portal_home_projection
--   FOR SELECT USING (
--     EXISTS (SELECT 1 FROM project_members WHERE project_members.project_id = portal_home_projection.project_id AND user_id = auth.uid())
--   );
