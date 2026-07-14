-- ==============================================================================
-- PHASE C3: Authorization Views
-- ==============================================================================
-- Description: Standard SQL views for fast permission resolution.
-- Idempotency: Uses CREATE OR REPLACE VIEW.
-- ==============================================================================

-- 1. effective_permissions
-- Resolves the flattened set of permissions for every user, across both direct 
-- role assignments and permission groups, scoped by organization.
CREATE OR REPLACE VIEW public.effective_permissions AS
-- A. Direct Role Permissions
SELECT 
    ur.user_id, 
    ur.organization_id, 
    rp.permission_id, 
    r.name as role_name
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permissions rp ON r.id = rp.role_id

UNION

-- B. Group Role Permissions
SELECT 
    ur.user_id, 
    ur.organization_id, 
    pgp.permission_id, 
    r.name as role_name
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
JOIN public.role_permission_groups rpg ON r.id = rpg.role_id
JOIN public.permission_group_permissions pgp ON rpg.group_id = pgp.group_id;


-- 2. effective_role_assignments
-- Simplifies querying which users have which roles in which organizations,
-- primarily used for the admin dashboard UI and tenant isolation checks.
CREATE OR REPLACE VIEW public.effective_role_assignments AS
SELECT 
    ur.user_id, 
    ur.organization_id, 
    r.id as role_id, 
    r.name as role_name,
    ur.id as assignment_id
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id;
