-- ==============================================================================
-- TECH AMBIANCE AGENCY OPERATING SYSTEM: DOMAIN SCHEMA (v1.0)
-- Bounded Contexts: CRM, Delivery, Finance, Communication, Assets, Audit
-- ==============================================================================

-- ==============================================================================
-- 1. BOUNDED CONTEXT: CRM (`backend/app/crm/`)
-- ==============================================================================

-- Lead Consultations Table
CREATE TABLE IF NOT EXISTS public.lead_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  website TEXT NULL,
  instagram TEXT NULL,
  city TEXT NULL,
  heard_source TEXT NULL,
  goals TEXT[] NOT NULL DEFAULT '{}',
  budget_range TEXT NOT NULL,
  timeline TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  preferred_contact TEXT NOT NULL DEFAULT 'WhatsApp',
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'REJECTED'
  reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commercial Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.lead_consultations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'DISCOVERY', -- 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'
  estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  assigned_to UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Master Services Proposals Table
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  proposal_number TEXT UNIQUE NOT NULL,
  scope_summary TEXT NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  advance_deposit_amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'SENT', -- 'DRAFT', 'SENT', 'ACCEPTED', 'EXPIRED', 'DECLINED'
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. BOUNDED CONTEXT: FINANCE (`backend/app/finance/`)
-- (Finance acts as Gatekeeper for client activation)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NULL REFERENCES public.proposals(id) ON DELETE SET NULL,
  organization_id UUID NULL REFERENCES public.organizations(id) ON DELETE SET NULL,
  workspace_id UUID NULL REFERENCES public.workspaces(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contract_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Master Services Agreement (MSA)',
  file_url TEXT NULL,
  signed_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'SIGNED', -- 'PENDING', 'SIGNED', 'TERMINATED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. BOUNDED CONTEXT: DELIVERY (`backend/app/delivery/`)
-- ==============================================================================

-- Project Templates Table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  default_lifecycle_stages TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects Table (Strict State Machine enforced)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  template_id UUID NULL REFERENCES public.project_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  lifecycle_stage TEXT NOT NULL DEFAULT 'DISCOVERY', -- 'DISCOVERY', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'QA', 'STAGING', 'PRODUCTION', 'MAINTENANCE', 'ARCHIVED'
  status TEXT NOT NULL DEFAULT 'Active Execution',
  active_sprint TEXT NULL,
  budget_formatted TEXT NULL,
  target_delivery_date DATE NULL,
  source_code_url TEXT NULL,
  staging_environment_url TEXT NULL,
  production_environment_url TEXT NULL,
  health_budget TEXT NOT NULL DEFAULT 'Healthy',
  health_timeline TEXT NOT NULL DEFAULT 'On Track',
  health_scope TEXT NOT NULL DEFAULT 'Locked',
  health_client_response TEXT NOT NULL DEFAULT 'Excellent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NULL,
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'completed', 'active', 'pending'
  display_order INTEGER NOT NULL DEFAULT 1,
  completed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Private Internal Notes Table (Strictly Admin only)
CREATE TABLE IF NOT EXISTS public.project_internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. BOUNDED CONTEXT: ASSETS (`backend/app/assets/`)
-- ==============================================================================

-- Deliverable Files linked directly to Milestones with Versioning
CREATE TABLE IF NOT EXISTS public.deliverable_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID NULL REFERENCES public.milestones(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  version_tag TEXT NOT NULL DEFAULT 'v1', -- 'v1', 'v2', 'Final'
  category TEXT NOT NULL DEFAULT 'Deliverables', -- 'Brand Assets', 'Contracts', 'Deliverables', 'Reports', 'Credentials'
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. BOUNDED CONTEXT: COMMUNICATION (`backend/app/communication/`)
-- ==============================================================================

-- Dual-Visibility Project Activity Feed (Client vs. Internal)
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Milestone', -- 'Deployment', 'Milestone', 'Finance', 'Design', 'Internal'
  visibility TEXT NOT NULL DEFAULT 'CLIENT', -- 'CLIENT', 'INTERNAL'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization-Level Executive Partnership Roadmap
CREATE TABLE IF NOT EXISTS public.client_journey_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_date TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'active', 'pending'
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. BOUNDED CONTEXT: AUDIT (`backend/app/audit/`)
-- ==============================================================================

-- Immutable Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g. 'STATUS_TRANSITION', 'INVOICE_ISSUED', 'ROLE_GRANTED'
  target_entity_type TEXT NOT NULL, -- e.g. 'Project', 'Invoice', 'UserRole'
  target_entity_id UUID NOT NULL,
  old_state JSONB NULL,
  new_state JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY POLICIES FOR ALL DOMAIN TABLES
-- ==============================================================================

ALTER TABLE public.lead_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- CLIENT ACCESS POLICIES (Read-Only Projection for authorized Workspaces & Organizations)
CREATE POLICY "Clients can SELECT projects in their workspaces"
  ON public.projects FOR SELECT
  USING (
    workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Clients can SELECT milestones in their projects"
  ON public.milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clients can SELECT deliverable files in their projects"
  ON public.deliverable_files FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clients can SELECT CLIENT timeline events in their projects"
  ON public.timeline_events FOR SELECT
  USING (
    visibility = 'CLIENT' AND
    project_id IN (
      SELECT id FROM public.projects WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Clients can SELECT invoices in their organizations"
  ON public.invoices FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can SELECT journey events in their organizations"
  ON public.client_journey_events FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );
