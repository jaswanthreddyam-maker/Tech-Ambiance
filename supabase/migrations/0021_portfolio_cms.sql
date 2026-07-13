-- ==============================================================================
-- TECH AMBIANCE PORTFOLIO CMS: BOUNDED CONTEXT SCHEMA (v1.0)
-- Tables: portfolio_projects, portfolio_categories, portfolio_project_categories,
--         portfolio_metrics, portfolio_media, portfolio_project_links
-- Enum:   portfolio_status
-- Storage: portfolio/ bucket
-- ==============================================================================

-- 1. STATUS ENUM
-- ==============================================================================
DO $$ BEGIN
  CREATE TYPE portfolio_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. PORTFOLIO PROJECTS (Core Entity)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  cover_image_path TEXT,                              -- Supabase Storage path: portfolio/bhavanam.webp
  status          portfolio_status NOT NULL DEFAULT 'DRAFT',
  featured_rank   INTEGER,                            -- 1, 2, 3, or NULL
  display_order   INTEGER NOT NULL DEFAULT 0,
  technology_stack TEXT[] NOT NULL DEFAULT '{}',
  services        TEXT[] NOT NULL DEFAULT '{}',

  -- Case Study Content
  overview        TEXT,
  challenge       TEXT,
  solution        TEXT,

  -- SEO
  seo_title       TEXT,
  meta_description TEXT,
  og_image_path   TEXT,
  canonical_url   TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PORTFOLIO CATEGORIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT UNIQUE NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  icon            TEXT,                               -- Emoji or icon identifier
  color           TEXT,                               -- Hex color for filter pill
  display_order   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PORTFOLIO PROJECT ↔ CATEGORIES (Many-to-Many Join)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_project_categories (
  project_id      UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.portfolio_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- 5. PORTFOLIO METRICS (Normalized Impact Metrics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  metric_type     TEXT NOT NULL,                      -- e.g. RESERVATIONS, LOAD_TIME
  display_prefix  TEXT,                               -- e.g. +, $, ₹, <
  value           NUMERIC NOT NULL,                   -- e.g. 180, 1.2
  suffix          TEXT,                               -- e.g. %, s, x
  label           TEXT NOT NULL,                      -- e.g. Increase, Average
  sort_order      INTEGER DEFAULT 0
);

-- 6. PORTFOLIO MEDIA (Normalized Gallery)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  path            TEXT NOT NULL,                      -- Supabase Storage path
  alt_text        TEXT,
  caption         TEXT,
  media_type      TEXT NOT NULL DEFAULT 'IMAGE',      -- IMAGE, VIDEO, MOBILE_SCREENSHOT, DESKTOP_SCREENSHOT, BEFORE_AFTER
  display_order   INTEGER DEFAULT 0
);

-- 7. PORTFOLIO PROJECT LINKS (Normalized External Links)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_project_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  link_type       TEXT NOT NULL,                      -- LIVE_WEBSITE, GITHUB, FIGMA, CASE_STUDY_PDF, YOUTUBE, OTHER
  url             TEXT NOT NULL,
  label           TEXT,                               -- Display label
  display_order   INTEGER DEFAULT 0
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status ON public.portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_slug ON public.portfolio_projects(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON public.portfolio_projects(featured_rank) WHERE featured_rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON public.portfolio_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_metrics_project ON public.portfolio_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_media_project ON public.portfolio_media(project_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_links_project ON public.portfolio_project_links(project_id);

-- ==============================================================================
-- UPDATED_AT TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER trg_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_portfolio_updated_at();

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_project_links ENABLE ROW LEVEL SECURITY;

-- Public READ for published projects
CREATE POLICY "Public can view published portfolio projects"
  ON public.portfolio_projects FOR SELECT
  USING (status = 'PUBLISHED');

CREATE POLICY "Public can view portfolio categories"
  ON public.portfolio_categories FOR SELECT
  USING (true);

CREATE POLICY "Public can view published project categories"
  ON public.portfolio_project_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_projects pp
      WHERE pp.id = project_id AND pp.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Public can view published project metrics"
  ON public.portfolio_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_projects pp
      WHERE pp.id = project_id AND pp.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Public can view published project media"
  ON public.portfolio_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_projects pp
      WHERE pp.id = project_id AND pp.status = 'PUBLISHED'
    )
  );

CREATE POLICY "Public can view published project links"
  ON public.portfolio_project_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_projects pp
      WHERE pp.id = project_id AND pp.status = 'PUBLISHED'
    )
  );

-- 1. Helper function for fast RLS evaluation
CREATE OR REPLACE FUNCTION public.is_studio_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
      AND r.name IN ('OWNER', 'ADMIN', 'DEVELOPER', 'DESIGNER', 'PROJECT_MANAGER')
  ) OR EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid() 
      AND u.email IN ('jaswanthreddyam@gmail.com', 'jeshu0069@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin CRUD (uses service_role key from repository, bypasses RLS)
-- For authenticated admin access, grant via user_roles check:
CREATE POLICY "Admins can manage portfolio projects"
  ON public.portfolio_projects FOR ALL
  USING (public.is_studio_admin());

CREATE POLICY "Admins can manage portfolio categories"
  ON public.portfolio_categories FOR ALL
  USING (public.is_studio_admin());

CREATE POLICY "Admins can manage portfolio project categories"
  ON public.portfolio_project_categories FOR ALL
  USING (public.is_studio_admin());

CREATE POLICY "Admins can manage portfolio metrics"
  ON public.portfolio_metrics FOR ALL
  USING (public.is_studio_admin());

CREATE POLICY "Admins can manage portfolio media"
  ON public.portfolio_media FOR ALL
  USING (public.is_studio_admin());

CREATE POLICY "Admins can manage portfolio project links"
  ON public.portfolio_project_links FOR ALL
  USING (public.is_studio_admin());

-- ==============================================================================
-- SEED: Default Categories
-- ==============================================================================
INSERT INTO public.portfolio_categories (name, slug, icon, color, display_order) VALUES
  ('Culinary & Dining',    'culinary-dining',    '🍽', '#C9A56A', 1),
  ('Luxury Hospitality',   'luxury-hospitality',  '✨', '#D4AF37', 2),
  ('Health & Fitness',     'health-fitness',      '💪', '#2E7D5B', 3),
  ('E-Commerce',           'e-commerce',          '🛍', '#8B5CF6', 4),
  ('SaaS & Technology',    'saas-technology',     '⚙️', '#3B82F6', 5),
  ('Healthcare & Medical', 'healthcare-medical',  '🏥', '#10B981', 6),
  ('Real Estate & Luxury', 'real-estate-luxury',  '🏠', '#F59E0B', 7),
  ('Branding & Identity',  'branding-identity',   '🎨', '#EC4899', 8)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- SEED: Migrate existing portfolio projects from content layer
-- ==============================================================================

-- Cafe Vistaara
INSERT INTO public.portfolio_projects (slug, title, description, cover_image_path, status, featured_rank, display_order, technology_stack, services, overview, challenge, solution)
VALUES (
  'cafe-vistaara',
  'Cafe Vistaara',
  'A complete digital transformation for a premium cafe chain, focusing on organic reservations and an immersive brand experience.',
  'projects/vistaara-cover.avif',
  'PUBLISHED',
  1,
  1,
  ARRAY['React', 'Next.js', 'Framer Motion'],
  ARRAY['UI/UX Design', 'Web Development', 'SEO Strategy'],
  'Cafe Vistaara sought to digitize their premium dining experience. We designed a web experience reflecting their organic luxury menu and fine-dining aesthetics, integrating smooth parallax sections and custom interactive booking flows.',
  'Traditional dining sites are heavily template-based and fail to evoke the sensory elegance of a physical fine-dining restaurant, leading to low reservation completion rates.',
  'Using a curated warm-cream color palette, fine serif headings, and micro-interactions, we created a UI that feels luxurious and responsive on every screen. Developed using React + Vite with optimized WebP assets and Lenis smooth scroll.'
) ON CONFLICT (slug) DO NOTHING;

-- Restaurant (Bhavanam)
INSERT INTO public.portfolio_projects (slug, title, description, cover_image_path, status, featured_rank, display_order, technology_stack, services, overview)
VALUES (
  'restaurant',
  'Restaurant',
  'Bespoke digital reservation platform and luxury brand showcase for an acclaimed dining destination.',
  'projects/restaurant-cover.png',
  'PUBLISHED',
  2,
  2,
  ARRAY['React', 'Tailwind CSS'],
  ARRAY['Web Development', 'Conversion Optimization'],
  'Bhavanam Restaurant needed a premium digital presence that communicates their authentic South Indian culinary heritage while driving direct table bookings.'
) ON CONFLICT (slug) DO NOTHING;

-- Seed metrics for Cafe Vistaara
INSERT INTO public.portfolio_metrics (project_id, metric_type, display_prefix, value, suffix, label, sort_order)
SELECT pp.id, 'RESERVATIONS', '+', 180, '%', 'Increase', 1
FROM public.portfolio_projects pp WHERE pp.slug = 'cafe-vistaara'
ON CONFLICT DO NOTHING;

INSERT INTO public.portfolio_metrics (project_id, metric_type, display_prefix, value, suffix, label, sort_order)
SELECT pp.id, 'LOAD_TIME', NULL, 1.2, 's', 'Average', 2
FROM public.portfolio_projects pp WHERE pp.slug = 'cafe-vistaara'
ON CONFLICT DO NOTHING;

-- Seed metrics for Restaurant
INSERT INTO public.portfolio_metrics (project_id, metric_type, display_prefix, value, suffix, label, sort_order)
SELECT pp.id, 'BOOKINGS', '+', 65, '%', 'Direct Reservations', 1
FROM public.portfolio_projects pp WHERE pp.slug = 'restaurant'
ON CONFLICT DO NOTHING;

-- Seed links for Restaurant
INSERT INTO public.portfolio_project_links (project_id, link_type, url, label, display_order)
SELECT pp.id, 'LIVE_WEBSITE', 'https://bhavanamrestaurantdemo.netlify.app', 'Visit Live Experience', 1
FROM public.portfolio_projects pp WHERE pp.slug = 'restaurant'
ON CONFLICT DO NOTHING;

-- Seed category associations
INSERT INTO public.portfolio_project_categories (project_id, category_id)
SELECT pp.id, pc.id
FROM public.portfolio_projects pp, public.portfolio_categories pc
WHERE pp.slug = 'cafe-vistaara' AND pc.slug = 'luxury-hospitality'
ON CONFLICT DO NOTHING;

INSERT INTO public.portfolio_project_categories (project_id, category_id)
SELECT pp.id, pc.id
FROM public.portfolio_projects pp, public.portfolio_categories pc
WHERE pp.slug = 'cafe-vistaara' AND pc.slug = 'culinary-dining'
ON CONFLICT DO NOTHING;

INSERT INTO public.portfolio_project_categories (project_id, category_id)
SELECT pp.id, pc.id
FROM public.portfolio_projects pp, public.portfolio_categories pc
WHERE pp.slug = 'restaurant' AND pc.slug = 'culinary-dining'
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- GRANTS (service_role access for Edge Functions / server-side operations)
-- ==============================================================================
GRANT ALL ON public.portfolio_projects TO service_role;
GRANT ALL ON public.portfolio_categories TO service_role;
GRANT ALL ON public.portfolio_project_categories TO service_role;
GRANT ALL ON public.portfolio_metrics TO service_role;
GRANT ALL ON public.portfolio_media TO service_role;
GRANT ALL ON public.portfolio_project_links TO service_role;
