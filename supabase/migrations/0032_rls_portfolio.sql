-- ==============================================================================
-- PHASE C7.1: Portfolio Module RLS Rewrite
-- ==============================================================================
-- Additive migration implementing the Phase B5 frontend authorization contract.
-- ==============================================================================

-- 1. Helper Functions
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'authenticated';
$$;

CREATE OR REPLACE FUNCTION public.is_anonymous()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.role() = 'anon';
$$;

-- Global tenant access check (currently open, will be scoped in future modules)
CREATE OR REPLACE FUNCTION public.can_access_tenant(tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  -- Currently global admins can access all tenants, but this establishes the axis.
  -- Expand this logic when tenant isolation becomes strict.
  SELECT true;
$$;

-- Portfolio specific helper
CREATE OR REPLACE FUNCTION public.is_public_portfolio(project public.portfolio_projects)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = public, pg_temp
AS $$
  SELECT project.status = 'PUBLISHED';
$$;

-- Grant execution on helpers to anon and authenticated
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_anonymous() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_tenant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_public_portfolio(public.portfolio_projects) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(text) TO anon, authenticated;


-- 2. Base Grants
-- ==============================================================================
-- Base privileges are required before RLS policies can be evaluated.

GRANT SELECT ON public.portfolio_projects TO anon, authenticated;
GRANT SELECT ON public.portfolio_categories TO anon, authenticated;
GRANT SELECT ON public.portfolio_project_categories TO anon, authenticated;
GRANT SELECT ON public.portfolio_metrics TO anon, authenticated;
GRANT SELECT ON public.portfolio_media TO anon, authenticated;
GRANT SELECT ON public.portfolio_project_links TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_project_categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_metrics TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_media TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_project_links TO authenticated;


-- 3. Additive RLS Policies for Portfolio Tables
-- ==============================================================================

-- Drop ALL old policies to ensure a clean slate for C7 Rewrite
DO $$ 
DECLARE
    t TEXT;
    pol RECORD;
BEGIN
    FOR t IN SELECT unnest(ARRAY['portfolio_projects', 'portfolio_categories', 'portfolio_project_categories', 'portfolio_metrics', 'portfolio_media', 'portfolio_project_links']) LOOP
        FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
        END LOOP;
    END LOOP;
END $$;

-- Table: portfolio_projects
CREATE POLICY "portfolio_public_read" ON public.portfolio_projects FOR SELECT TO PUBLIC
USING ( public.is_public_portfolio(portfolio_projects) );

CREATE POLICY "portfolio_admin_read" ON public.portfolio_projects FOR SELECT TO authenticated
USING ( public.has_permission('portfolio:read') );

CREATE POLICY "portfolio_admin_insert" ON public.portfolio_projects FOR INSERT TO authenticated
WITH CHECK ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_update" ON public.portfolio_projects FOR UPDATE TO authenticated
USING ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_delete" ON public.portfolio_projects FOR DELETE TO authenticated
USING ( public.has_permission('portfolio:delete') );

-- Table: portfolio_categories
CREATE POLICY "portfolio_public_read" ON public.portfolio_categories FOR SELECT TO PUBLIC
USING ( true );

CREATE POLICY "portfolio_admin_read" ON public.portfolio_categories FOR SELECT TO authenticated
USING ( public.has_permission('portfolio:read') );

CREATE POLICY "portfolio_admin_insert" ON public.portfolio_categories FOR INSERT TO authenticated
WITH CHECK ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_update" ON public.portfolio_categories FOR UPDATE TO authenticated
USING ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_delete" ON public.portfolio_categories FOR DELETE TO authenticated
USING ( public.has_permission('portfolio:delete') );

-- Table: portfolio_project_categories
-- Public can view if the associated project is published
CREATE POLICY "portfolio_public_read" ON public.portfolio_project_categories FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM public.portfolio_projects pp
    WHERE pp.id = portfolio_project_categories.project_id AND public.is_public_portfolio(pp)
  )
);

CREATE POLICY "portfolio_admin_read" ON public.portfolio_project_categories FOR SELECT TO authenticated
USING ( public.has_permission('portfolio:read') );

CREATE POLICY "portfolio_admin_insert" ON public.portfolio_project_categories FOR INSERT TO authenticated
WITH CHECK ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_update" ON public.portfolio_project_categories FOR UPDATE TO authenticated
USING ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_delete" ON public.portfolio_project_categories FOR DELETE TO authenticated
USING ( public.has_permission('portfolio:delete') );

-- Table: portfolio_metrics
CREATE POLICY "portfolio_public_read" ON public.portfolio_metrics FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM public.portfolio_projects pp
    WHERE pp.id = portfolio_metrics.project_id AND public.is_public_portfolio(pp)
  )
);

CREATE POLICY "portfolio_admin_read" ON public.portfolio_metrics FOR SELECT TO authenticated
USING ( public.has_permission('portfolio:read') );

CREATE POLICY "portfolio_admin_insert" ON public.portfolio_metrics FOR INSERT TO authenticated
WITH CHECK ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_update" ON public.portfolio_metrics FOR UPDATE TO authenticated
USING ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_delete" ON public.portfolio_metrics FOR DELETE TO authenticated
USING ( public.has_permission('portfolio:delete') );

-- Table: portfolio_media
CREATE POLICY "portfolio_public_read" ON public.portfolio_media FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM public.portfolio_projects pp
    WHERE pp.id = portfolio_media.project_id AND public.is_public_portfolio(pp)
  )
);

CREATE POLICY "portfolio_admin_read" ON public.portfolio_media FOR SELECT TO authenticated
USING ( public.has_permission('portfolio:read') );

CREATE POLICY "portfolio_admin_insert" ON public.portfolio_media FOR INSERT TO authenticated
WITH CHECK ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_update" ON public.portfolio_media FOR UPDATE TO authenticated
USING ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_delete" ON public.portfolio_media FOR DELETE TO authenticated
USING ( public.has_permission('portfolio:delete') );

-- Table: portfolio_project_links
CREATE POLICY "portfolio_public_read" ON public.portfolio_project_links FOR SELECT TO PUBLIC
USING (
  EXISTS (
    SELECT 1 FROM public.portfolio_projects pp
    WHERE pp.id = portfolio_project_links.project_id AND public.is_public_portfolio(pp)
  )
);

CREATE POLICY "portfolio_admin_read" ON public.portfolio_project_links FOR SELECT TO authenticated
USING ( public.has_permission('portfolio:read') );

CREATE POLICY "portfolio_admin_insert" ON public.portfolio_project_links FOR INSERT TO authenticated
WITH CHECK ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_update" ON public.portfolio_project_links FOR UPDATE TO authenticated
USING ( public.has_permission('portfolio:write') );

CREATE POLICY "portfolio_admin_delete" ON public.portfolio_project_links FOR DELETE TO authenticated
USING ( public.has_permission('portfolio:delete') );
