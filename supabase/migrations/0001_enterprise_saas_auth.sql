-- ==============================================================================
-- TECH AMBIANCE STUDIOHQ & CLIENT PORTAL ENTERPRISE SAAS AUTH SCHEMA (v3.0)
-- 10/10 True Membership Architecture (Linear / Vercel / GitHub Grade)
-- ==============================================================================

-- 1. Reusable Slugify Helper Function
CREATE OR REPLACE FUNCTION public.slugify(v TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(TRIM(COALESCE(v, '')), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT NULL,
  brand_color TEXT NOT NULL DEFAULT '#0B3027',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  country TEXT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ARCHIVED', 'SUSPENDED'
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

-- 4. Profiles Table (Global User Profile tied to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NULL,
  active_organization_id UUID NULL REFERENCES public.organizations(id) ON DELETE SET NULL,
  active_workspace_id UUID NULL REFERENCES public.workspaces(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Organization Members Table (Explicit Multi-Tenant Junction)
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

-- 6. Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_id)
);

-- 7. Roles Table (Normalized RBAC Taxonomy)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NULL
);

INSERT INTO public.roles (name, description) VALUES
  ('OWNER', 'Executive organization owner with full administrative and financial control'),
  ('ADMIN', 'Administrative management access across StudioHQ'),
  ('DEVELOPER', 'Technical developer access to codebase, pipelines, and AI center'),
  ('DESIGNER', 'Luxury UI/UX design & brand asset console access'),
  ('PROJECT_MANAGER', 'Project management, timeline, milestone & roadmap control'),
  ('STRATEGIST', 'Strategic business & marketing console access'),
  ('SALES', 'CRM pipeline, lead qualification & proposal management access'),
  ('CLIENT', 'Client portal project, milestone and invoice access')
ON CONFLICT (name) DO NOTHING;

-- 8. User Roles Junction Table (Audit-Ready Multi-Role Assignment)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- 9. Future-Ready Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Atomic Dual-Path Provisioning Function (Normal vs. Invited Signup)
CREATE OR REPLACE FUNCTION public.handle_new_user_provisioning()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_workspace_id UUID;
  v_role_id UUID;
  v_invite_record RECORD;
  v_org_name TEXT;
  v_org_slug TEXT;
  v_workspace_slug TEXT;
BEGIN
  -- Create global Profile record
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Check if user signed up via an active invitation (Flow B: Invitation Signup)
  SELECT * INTO v_invite_record
  FROM public.invitations
  WHERE email = NEW.email AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invite_record.id IS NOT NULL THEN
    -- Join Existing Organization
    INSERT INTO public.organization_members (organization_id, user_id, is_default)
    VALUES (v_invite_record.organization_id, NEW.id, true)
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    -- Assign invited Role
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_invite_record.role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- Update active organization on Profile
    UPDATE public.profiles
    SET active_organization_id = v_invite_record.organization_id
    WHERE id = NEW.id;

    -- Delete consumed invitation
    DELETE FROM public.invitations WHERE id = v_invite_record.id;
  ELSE
    -- Flow A: Normal Signup (Create Organization & Default Workspace)
    v_org_name := COALESCE(
      NEW.raw_user_meta_data->>'organization_name',
      CASE WHEN COALESCE(NEW.raw_user_meta_data->>'full_name', '') <> ''
           THEN NEW.raw_user_meta_data->>'full_name' || ' Studio'
           ELSE 'Tech Ambiance Studio'
      END
    );
    v_org_slug := public.slugify(v_org_name) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    v_workspace_slug := public.slugify(v_org_name) || '-workspace';

    -- Create Organization
    INSERT INTO public.organizations (name, slug)
    VALUES (v_org_name, v_org_slug)
    RETURNING id INTO v_org_id;

    -- Create Default Workspace
    INSERT INTO public.workspaces (organization_id, name, slug, is_default, status)
    VALUES (v_org_id, 'Primary Workspace', v_workspace_slug, true, 'ACTIVE')
    RETURNING id INTO v_workspace_id;

    -- Create Organization Membership
    INSERT INTO public.organization_members (organization_id, user_id, is_default)
    VALUES (v_org_id, NEW.id, true);

    -- Create Workspace Membership
    INSERT INTO public.workspace_members (workspace_id, user_id)
    VALUES (v_workspace_id, NEW.id);

    -- Update active pointers on Profile
    UPDATE public.profiles
    SET active_organization_id = v_org_id, active_workspace_id = v_workspace_id
    WHERE id = NEW.id;

    -- Assign OWNER role
    SELECT id INTO v_role_id FROM public.roles WHERE name = 'OWNER';
    IF v_role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (NEW.id, v_role_id);
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to provision user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_provisioning();

-- 11. Row Level Security (RLS) Configuration
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select and update only their own profile
CREATE POLICY "Users can SELECT own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can UPDATE own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Organization Members: Users can see organizations they belong to
CREATE POLICY "Users can SELECT member organizations"
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid())
  );

-- Workspace Members: Users can see workspaces they belong to
CREATE POLICY "Users can SELECT member workspaces"
  ON public.workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  );
