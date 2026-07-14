-- ==============================================================================
-- PHASE C7.5: Credentials Schema Split
-- ==============================================================================
-- Splits project_credentials into metadata and secrets to ensure encrypted
-- references are isolated from standard table reads.
-- ==============================================================================

BEGIN;

-- 1. Create project_credential_secrets table
CREATE TABLE IF NOT EXISTS public.project_credential_secrets (
  credential_id UUID PRIMARY KEY REFERENCES public.project_credentials(id) ON DELETE CASCADE,
  secret_reference TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Migrate existing secret_references
INSERT INTO public.project_credential_secrets (credential_id, secret_reference, version, created_at, updated_at)
SELECT id, secret_reference, version, created_at, updated_at
FROM public.project_credentials
ON CONFLICT DO NOTHING;

-- 3. Drop secret_reference from project_credentials
ALTER TABLE public.project_credentials DROP COLUMN secret_reference;

-- 4. Enable RLS on secrets table
ALTER TABLE public.project_credential_secrets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.project_credential_secrets TO authenticated;

COMMIT;
