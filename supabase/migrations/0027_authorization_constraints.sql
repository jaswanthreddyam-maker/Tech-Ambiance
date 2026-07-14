-- ==============================================================================
-- PHASE C2: Authorization Constraints & Indexes
-- ==============================================================================
-- Description: Foreign keys, unique constraints, and indexes for authorization.
-- Idempotency: Uses IF NOT EXISTS for indexes and DO/EXCEPTION blocks for constraints.
-- ==============================================================================

-- 1. roles
DO $$ BEGIN
    ALTER TABLE public.roles ADD CONSTRAINT roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.roles ADD CONSTRAINT roles_organization_name_key UNIQUE (organization_id, name);
EXCEPTION WHEN duplicate_table THEN NULL; WHEN duplicate_object THEN NULL; WHEN others THEN
    IF SQLSTATE != '42P07' THEN RAISE; END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_roles_organization_id ON public.roles(organization_id);


-- 2. permissions
CREATE INDEX IF NOT EXISTS idx_permissions_module ON public.permissions(module);


-- 3. role_permissions
DO $$ BEGIN
    ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);


-- 4. user_roles
DO $$ BEGIN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Postgres 15+ allows NULLS NOT DISTINCT in unique constraints. 
-- However, standard UNIQUE NULLS NOT DISTINCT might not be supported in older versions, 
-- but Supabase uses Postgres 15+. Let's create a unique index if possible.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique_assignment ON public.user_roles(user_id, role_id, organization_id) NULLS NOT DISTINCT;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON public.user_roles(organization_id);


-- 5. permission_groups
DO $$ BEGIN
    ALTER TABLE public.permission_groups ADD CONSTRAINT permission_groups_name_key UNIQUE (name);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 6. permission_group_permissions
DO $$ BEGIN
    ALTER TABLE public.permission_group_permissions ADD CONSTRAINT group_permissions_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.permission_groups(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.permission_group_permissions ADD CONSTRAINT group_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_group_perms_group_id ON public.permission_group_permissions(group_id);


-- 7. role_permission_groups
DO $$ BEGIN
    ALTER TABLE public.role_permission_groups ADD CONSTRAINT role_groups_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.role_permission_groups ADD CONSTRAINT role_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.permission_groups(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_role_groups_role_id ON public.role_permission_groups(role_id);
CREATE INDEX IF NOT EXISTS idx_role_groups_group_id ON public.role_permission_groups(group_id);


-- 8. authorization_metadata
DO $$ BEGIN
    ALTER TABLE public.authorization_metadata ADD CONSTRAINT auth_meta_org_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- 9. authorization_audit
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON public.authorization_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_org_id ON public.authorization_audit(organization_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON public.authorization_audit(created_at);


-- 10. authorization_events
CREATE INDEX IF NOT EXISTS idx_auth_events_org_id ON public.authorization_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_created_at ON public.authorization_events(created_at);
