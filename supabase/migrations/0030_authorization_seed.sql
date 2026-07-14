-- ==============================================================================
-- PHASE C5: Authorization Seed
-- ==============================================================================
-- Description: Seeds the core authorization taxonomy via UPSERTS.
-- Version: 1
-- ==============================================================================

BEGIN;

-- 1. Seed Permissions
INSERT INTO public.permissions (id, module, name, description, dangerous) VALUES
  ('dashboard:read', 'Dashboard', 'View Dashboard', 'Can view the overview dashboard', false),
  ('dashboard:export', 'Dashboard', 'Export Dashboard', 'Can export executive reports and metrics', false),
  
  ('portfolio:read', 'Portfolio', 'View Portfolio', 'Can view portfolio projects', false),
  ('portfolio:write', 'Portfolio', 'Edit Portfolio', 'Can create and edit portfolio projects', false),
  ('portfolio:delete', 'Portfolio', 'Delete Portfolio', 'Can permanently delete portfolio projects', true),
  ('portfolio:publish', 'Portfolio', 'Publish Portfolio', 'Can change project status to published', false),
  ('project:read', 'Portfolio', 'View Projects', 'Can view internal operational projects', false),
  
  ('crm:read', 'CRM', 'View CRM', 'Can view leads and pipelines', false),
  ('crm:write', 'CRM', 'Edit CRM', 'Can update lead status and details', false),
  ('crm:delete', 'CRM', 'Delete Lead', 'Can delete leads from pipeline', true),
  ('crm:export', 'CRM', 'Export CRM', 'Can export pipeline data to CSV', false),
  ('crm:proposal', 'CRM', 'Generate Proposals', 'Can generate interactive SOWs', false),
  
  ('workspace:read', 'Workspaces', 'View Workspaces', 'Can view client workspaces', false),
  ('workspace:write', 'Workspaces', 'Edit Workspaces', 'Can edit workspace details and projects', false),
  ('workspace:delete', 'Workspaces', 'Delete Workspaces', 'Can delete workspaces', true),
  ('workspace:provision', 'Workspaces', 'Provision Workspace', 'Can provision new client environments', false),
  
  ('media:read', 'Media', 'View Media', 'Can browse the media vault', false),
  ('media:upload', 'Media', 'Upload Media', 'Can upload assets to edge storage', false),
  ('media:delete', 'Media', 'Delete Media', 'Can delete assets from edge storage', true),
  
  ('ai:read', 'AI', 'View AI Center', 'Can view the AI Center dashboard', false),
  ('ai:scout', 'AI', 'Run ScoutAI', 'Can execute autonomous diagnostic scans', false),
  ('ai:generate', 'AI', 'Generate SOW (AI)', 'Can use AI to generate Executive Summaries', false),
  
  ('cms:read', 'CMS', 'View CMS', 'Can view website drafts and diffs', false),
  ('cms:edit', 'CMS', 'Edit CMS', 'Can edit website copy and sections', false),
  ('cms:publish', 'CMS', 'Publish CMS', 'Can trigger cache invalidation and publish to edge', true),
  ('cms:rollback', 'CMS', 'Rollback CMS', 'Can rollback website to previous snapshot', true),
  
  ('system:read', 'System', 'View System Settings', 'Can view system and workspace settings', false),
  ('system:audit', 'System', 'View Audit Logs', 'Can view security audit logs', false),
  ('system:roles', 'System', 'Manage Roles', 'Can modify role definitions and assignments', true),
  ('system:users', 'System', 'Manage Users', 'Can invite, revoke, or delete studio users', true),
  ('system:billing', 'System', 'Manage Billing', 'Can view and modify billing information', true),
  
  ('analytics:finance', 'Analytics', 'View Financial Analytics', 'Can view revenue and financial metrics', false)
ON CONFLICT (id) DO UPDATE SET
  module = EXCLUDED.module,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  dangerous = EXCLUDED.dangerous;


-- 2. Seed Permission Groups and Map to Permissions
DO $$
DECLARE
    g_portfolio_mgr uuid := '10000000-0000-0000-0000-000000000001';
    g_portfolio_ed uuid := '10000000-0000-0000-0000-000000000002';
    g_media_mgr uuid := '10000000-0000-0000-0000-000000000003';
    g_crm_mgr uuid := '10000000-0000-0000-0000-000000000004';
    g_cms_mgr uuid := '10000000-0000-0000-0000-000000000005';
    g_workspace_mgr uuid := '10000000-0000-0000-0000-000000000006';
    g_workspace_ed uuid := '10000000-0000-0000-0000-000000000007';
    g_team_mgr uuid := '10000000-0000-0000-0000-000000000008';
    g_ai_op uuid := '10000000-0000-0000-0000-000000000009';
    g_internal_base uuid := '10000000-0000-0000-0000-000000000010';
    g_sys_admin uuid := '10000000-0000-0000-0000-000000000011';
    g_auditor uuid := '10000000-0000-0000-0000-000000000012';
    g_analytics uuid := '10000000-0000-0000-0000-000000000013';
    g_exec_base uuid := '10000000-0000-0000-0000-000000000014';

    v_owner_id uuid := '00000000-0000-0000-0000-000000000001';
    v_admin_id uuid := '00000000-0000-0000-0000-000000000002';
    v_dev_id uuid := '00000000-0000-0000-0000-000000000003';
    v_designer_id uuid := '00000000-0000-0000-0000-000000000004';
    v_pm_id uuid := '00000000-0000-0000-0000-000000000005';
    v_strat_id uuid := '00000000-0000-0000-0000-000000000006';
    v_sales_id uuid := '00000000-0000-0000-0000-000000000007';
    v_client_id uuid := '00000000-0000-0000-0000-000000000008';
    v_auditor_id uuid := '00000000-0000-0000-0000-000000000009';
BEGIN
    INSERT INTO public.permission_groups (id, name, description) VALUES
      (g_portfolio_mgr, 'Portfolio Manager', 'Full portfolio CRUD and publish'),
      (g_portfolio_ed, 'Portfolio Editor', 'Portfolio create and edit'),
      (g_media_mgr, 'Media Manager', 'Full media CRUD'),
      (g_crm_mgr, 'CRM Manager', 'Full CRM access'),
      (g_cms_mgr, 'CMS Manager', 'Full CMS access'),
      (g_workspace_mgr, 'Workspace Manager', 'Full workspace management'),
      (g_workspace_ed, 'Workspace Editor', 'Workspace editor'),
      (g_team_mgr, 'Team Manager', 'Full team management'),
      (g_ai_op, 'AI Operator', 'Full AI access'),
      (g_internal_base, 'Internal Baseline', 'Dashboard read'),
      (g_sys_admin, 'System Admin', 'System and billing admin'),
      (g_auditor, 'Auditor Group', 'Read only system auditing'),
      (g_analytics, 'Analytics Viewer', 'Analytics access'),
      (g_exec_base, 'Executive Baseline', 'Dashboard export access')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description;

    INSERT INTO public.permission_group_permissions (group_id, permission_id) VALUES
      (g_portfolio_mgr, 'portfolio:read'), (g_portfolio_mgr, 'portfolio:write'), (g_portfolio_mgr, 'portfolio:delete'), (g_portfolio_mgr, 'portfolio:publish'), (g_portfolio_mgr, 'project:read'),
      (g_portfolio_ed, 'portfolio:read'), (g_portfolio_ed, 'portfolio:write'),
      
      (g_media_mgr, 'media:read'), (g_media_mgr, 'media:upload'), (g_media_mgr, 'media:delete'),
      
      (g_crm_mgr, 'crm:read'), (g_crm_mgr, 'crm:write'), (g_crm_mgr, 'crm:delete'), (g_crm_mgr, 'crm:export'), (g_crm_mgr, 'crm:proposal'),
      
      (g_cms_mgr, 'cms:read'), (g_cms_mgr, 'cms:edit'), (g_cms_mgr, 'cms:publish'), (g_cms_mgr, 'cms:rollback'),
      
      (g_workspace_mgr, 'workspace:read'), (g_workspace_mgr, 'workspace:write'), (g_workspace_mgr, 'workspace:delete'), (g_workspace_mgr, 'workspace:provision'),
      (g_workspace_ed, 'workspace:read'), (g_workspace_ed, 'workspace:write'),
      
      (g_team_mgr, 'system:read'), (g_team_mgr, 'system:users'), (g_team_mgr, 'system:roles'),
      
      (g_ai_op, 'ai:read'), (g_ai_op, 'ai:scout'), (g_ai_op, 'ai:generate'),
      
      (g_internal_base, 'dashboard:read'),
      (g_exec_base, 'dashboard:export'),
      
      (g_sys_admin, 'system:billing'), (g_sys_admin, 'system:read'),
      
      (g_auditor, 'system:audit'), (g_auditor, 'system:read'),
      
      (g_analytics, 'analytics:finance')
    ON CONFLICT (group_id, permission_id) DO NOTHING;

    -- 4. Seed System Roles
    UPDATE public.roles SET description = 'Ultimate authority', is_system = true WHERE name = 'OWNER' AND organization_id IS NULL RETURNING id INTO v_owner_id;
    IF v_owner_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('OWNER', 'Ultimate authority', true) RETURNING id INTO v_owner_id;
    END IF;

    UPDATE public.roles SET description = 'System administrator', is_system = true WHERE name = 'ADMIN' AND organization_id IS NULL RETURNING id INTO v_admin_id;
    IF v_admin_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('ADMIN', 'System administrator', true) RETURNING id INTO v_admin_id;
    END IF;

    UPDATE public.roles SET description = 'Technical integration and development', is_system = true WHERE name = 'DEVELOPER' AND organization_id IS NULL RETURNING id INTO v_dev_id;
    IF v_dev_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('DEVELOPER', 'Technical integration and development', true) RETURNING id INTO v_dev_id;
    END IF;

    UPDATE public.roles SET description = 'UI/UX and asset design', is_system = true WHERE name = 'DESIGNER' AND organization_id IS NULL RETURNING id INTO v_designer_id;
    IF v_designer_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('DESIGNER', 'UI/UX and asset design', true) RETURNING id INTO v_designer_id;
    END IF;

    UPDATE public.roles SET description = 'Project tracking and management', is_system = true WHERE name = 'PROJECT_MANAGER' AND organization_id IS NULL RETURNING id INTO v_pm_id;
    IF v_pm_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('PROJECT_MANAGER', 'Project tracking and management', true) RETURNING id INTO v_pm_id;
    END IF;

    UPDATE public.roles SET description = 'Strategic planning and analytics', is_system = true WHERE name = 'STRATEGIST' AND organization_id IS NULL RETURNING id INTO v_strat_id;
    IF v_strat_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('STRATEGIST', 'Strategic planning and analytics', true) RETURNING id INTO v_strat_id;
    END IF;

    UPDATE public.roles SET description = 'CRM and client onboarding', is_system = true WHERE name = 'SALES' AND organization_id IS NULL RETURNING id INTO v_sales_id;
    IF v_sales_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('SALES', 'CRM and client onboarding', true) RETURNING id INTO v_sales_id;
    END IF;

    UPDATE public.roles SET description = 'External client access', is_system = true WHERE name = 'CLIENT' AND organization_id IS NULL RETURNING id INTO v_client_id;
    IF v_client_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('CLIENT', 'External client access', true) RETURNING id INTO v_client_id;
    END IF;

    UPDATE public.roles SET description = 'Read-only compliance and auditing', is_system = true WHERE name = 'AUDITOR' AND organization_id IS NULL RETURNING id INTO v_auditor_id;
    IF v_auditor_id IS NULL THEN
        INSERT INTO public.roles (name, description, is_system) VALUES ('AUDITOR', 'Read-only compliance and auditing', true) RETURNING id INTO v_auditor_id;
    END IF;

    -- 5. Map Groups to Roles
    INSERT INTO public.role_permission_groups (role_id, group_id) VALUES
      (v_owner_id, g_portfolio_mgr), (v_owner_id, g_media_mgr), (v_owner_id, g_crm_mgr), (v_owner_id, g_cms_mgr), (v_owner_id, g_workspace_mgr), (v_owner_id, g_team_mgr), (v_owner_id, g_ai_op), (v_owner_id, g_sys_admin), (v_owner_id, g_internal_base), (v_owner_id, g_exec_base), (v_owner_id, g_auditor), (v_owner_id, g_analytics),
      (v_admin_id, g_portfolio_mgr), (v_admin_id, g_media_mgr), (v_admin_id, g_crm_mgr), (v_admin_id, g_cms_mgr), (v_admin_id, g_workspace_mgr), (v_admin_id, g_team_mgr), (v_admin_id, g_ai_op), (v_admin_id, g_internal_base), (v_admin_id, g_exec_base), (v_admin_id, g_auditor), (v_admin_id, g_sys_admin),
      (v_dev_id, g_workspace_mgr), (v_dev_id, g_team_mgr), (v_dev_id, g_internal_base),
      (v_designer_id, g_media_mgr), (v_designer_id, g_internal_base),
      (v_pm_id, g_workspace_ed), (v_pm_id, g_internal_base),
      (v_strat_id, g_portfolio_mgr), (v_strat_id, g_crm_mgr), (v_strat_id, g_analytics), (v_strat_id, g_internal_base),
      (v_sales_id, g_crm_mgr), (v_sales_id, g_workspace_ed), (v_sales_id, g_internal_base),
      (v_client_id, g_portfolio_ed), (v_client_id, g_workspace_ed),
      (v_auditor_id, g_auditor), (v_auditor_id, g_analytics), (v_auditor_id, g_internal_base)
    ON CONFLICT (role_id, group_id) DO NOTHING;

    -- 6. Map Direct Permissions to Roles
    INSERT INTO public.role_permissions (role_id, permission_id) VALUES
      (v_dev_id, 'crm:read'), (v_dev_id, 'media:read'), (v_dev_id, 'system:audit'),
      (v_designer_id, 'ai:read'),
      (v_pm_id, 'portfolio:read'), (v_pm_id, 'crm:read'), (v_pm_id, 'cms:read'), (v_pm_id, 'ai:read'), (v_pm_id, 'media:read'),
      (v_strat_id, 'ai:read'), (v_strat_id, 'media:read'), (v_strat_id, 'workspace:read'),
      (v_client_id, 'cms:read'), (v_client_id, 'media:read'), (v_client_id, 'dashboard:read')
    ON CONFLICT (role_id, permission_id) DO NOTHING;

END $$;

-- 7. Authorization Metadata
-- Seed default org zero metadata (global). Or we can insert for specific orgs when they are created.
-- The user requested: permission_dictionary_version = 1.
-- Let's ensure the table has a global record for version if organization_id is nullable,
-- but organization_id is a foreign key to organizations.
-- Since the schema doesn't define a global row easily, we can just alter authorization_metadata table to add dictionary_version
-- Wait, the user said: "authorization_metadata -> permission_dictionary_version = 1".
-- Does authorization_metadata have this column?
-- Let's check `0026_authorization_tables.sql` to see if `dictionary_version` exists.
-- If not, we should ADD it now before upserting.
DO $$ BEGIN
    ALTER TABLE public.authorization_metadata ADD COLUMN IF NOT EXISTS permission_dictionary_version int DEFAULT 1;
EXCEPTION WHEN others THEN NULL; END $$;

COMMIT;
