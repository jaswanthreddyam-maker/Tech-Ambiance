-- ==============================================================================
-- MIGRATION: 0046_fix_projects_slug_trigger.sql
-- PURPOSE: Auto-generate slug for projects if null or empty on INSERT
-- Resolves error 23502 ("null value in column 'slug' of relation 'projects'")
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.generate_project_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    NEW.slug := lower(regexp_replace(COALESCE(NEW.name, 'project'), '[^a-zA-Z0-9]+', '-', 'g')) 
      || '-' || substring(gen_random_uuid()::text, 1, 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_slug ON public.projects;
CREATE TRIGGER trg_projects_slug
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.generate_project_slug();

COMMIT;
