-- ==============================================================================
-- PHASE C1: Authorization Tables
-- ==============================================================================
-- Description: Core tables for the enterprise authorization subsystem.
-- Idempotency: Uses IF NOT EXISTS and DO blocks for schema upgrades.
-- Note: Foreign Keys, Indexes, and Constraints are deferred to Phase C2.
-- ==============================================================================

-- 1. Core Authorization Tables

-- roles already exists from 0001_enterprise_saas_auth.sql, so we ALTER it
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid,
    name text NOT NULL,
    description text,
    is_system boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.roles
    ADD COLUMN IF NOT EXISTS organization_id uuid,
    ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.permissions (
    id text PRIMARY KEY,
    module text NOT NULL,
    name text NOT NULL,
    description text,
    dangerous boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id uuid NOT NULL,
    permission_id text NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- user_roles already exists from 0001_enterprise_saas_auth.sql
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    organization_id uuid,
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);

ALTER TABLE public.user_roles
    ADD COLUMN IF NOT EXISTS organization_id uuid,
    ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- We must drop the old primary key (user_id, role_id) and make `id` the primary key
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE table_name = 'user_roles' AND constraint_type = 'PRIMARY KEY' AND constraint_name = 'user_roles_pkey'
    ) THEN
        ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_pkey;
        ALTER TABLE public.user_roles ADD PRIMARY KEY (id);
    END IF;
END $$;


-- 2. Permission Groups Tables

CREATE TABLE IF NOT EXISTS public.permission_groups (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permission_group_permissions (
    group_id uuid NOT NULL,
    permission_id text NOT NULL,
    PRIMARY KEY (group_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.role_permission_groups (
    role_id uuid NOT NULL,
    group_id uuid NOT NULL,
    PRIMARY KEY (role_id, group_id)
);

-- 3. Operational & Telemetry Tables

CREATE TABLE IF NOT EXISTS public.authorization_metadata (
    organization_id uuid PRIMARY KEY,
    version int NOT NULL DEFAULT 1,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.authorization_audit (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid,
    organization_id uuid,
    permission_id text NOT NULL,
    resource_type text,
    resource_id text,
    decision text NOT NULL,
    decision_source text NOT NULL,
    reason text,
    ip_address inet,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.authorization_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid,
    actor_id uuid,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text NOT NULL,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.authorization_migrations (
    version int PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now(),
    checksum text NOT NULL,
    generator_version text NOT NULL
);
