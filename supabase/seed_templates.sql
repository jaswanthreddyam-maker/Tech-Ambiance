-- Seed Default Project Templates
BEGIN;

WITH website_template AS (
  INSERT INTO public.project_templates (name, description, default_lifecycle_stages, version, is_active)
  VALUES ('Website', 'Standard website project template with SEO and CMS.', '{"DISCOVERY", "DESIGN", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "MAINTENANCE"}', 1, true)
  ON CONFLICT (name) DO UPDATE SET is_active = true
  RETURNING id
),
seo_template AS (
  INSERT INTO public.project_templates (name, description, default_lifecycle_stages, version, is_active)
  VALUES ('SEO', 'Search Engine Optimization and Content Strategy.', '{"AUDIT", "STRATEGY", "IMPLEMENTATION", "MONITORING"}', 1, true)
  ON CONFLICT (name) DO UPDATE SET is_active = true
  RETURNING id
),
mobile_app_template AS (
  INSERT INTO public.project_templates (name, description, default_lifecycle_stages, version, is_active)
  VALUES ('Mobile App', 'Native or Cross-platform mobile application development.', '{"DISCOVERY", "UI/UX", "DEVELOPMENT", "BETA", "LAUNCH", "SUPPORT"}', 1, true)
  ON CONFLICT (name) DO UPDATE SET is_active = true
  RETURNING id
)
SELECT * FROM website_template;
-- Just a simple seed for now. We can add milestones and environments later if needed.

COMMIT;
