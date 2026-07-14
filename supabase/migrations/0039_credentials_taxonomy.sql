-- ==============================================================================
-- PHASE C7.5: Credentials Taxonomy
-- ==============================================================================
-- Seeds the credential taxonomy and renames Portfolio Manager.
-- ==============================================================================

BEGIN;

-- 1. Rename Portfolio Manager to Project Management
UPDATE public.permission_groups
SET name = 'Project Management'
WHERE name = 'Portfolio Manager';

-- 2. Seed Permissions
INSERT INTO public.permissions (id, module, name, description, dangerous) VALUES
  ('credentials:read', 'Credentials', 'View Credential Metadata', 'Can view credential names, descriptions, and metadata', false),
  ('credentials:decrypt', 'Credentials', 'Decrypt Credential Secret', 'Can decrypt and view the actual secret value', true),
  ('credentials:write', 'Credentials', 'Edit Credential Metadata', 'Can create and edit credential metadata', false),
  ('credentials:rotate', 'Credentials', 'Rotate Credential', 'Can rotate the credential secret value', true),
  ('credentials:delete', 'Credentials', 'Delete Credential', 'Can permanently delete credentials', true)
ON CONFLICT (id) DO UPDATE SET
  module = EXCLUDED.module,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  dangerous = EXCLUDED.dangerous;

-- 3. Map to Project Management and System Admin
INSERT INTO public.permission_group_permissions (permission_id, group_id)
SELECT p.id, g.id
FROM (
  VALUES
    ('credentials:read'),
    ('credentials:decrypt'),
    ('credentials:write'),
    ('credentials:rotate'),
    ('credentials:delete')
) AS p(id)
CROSS JOIN public.permission_groups g
WHERE g.name IN ('Project Management', 'System Admin')
ON CONFLICT DO NOTHING;

COMMIT;
