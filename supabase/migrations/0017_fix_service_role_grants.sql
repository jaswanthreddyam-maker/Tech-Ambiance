-- ==============================================================================
-- MIGRATION: 0017_fix_service_role_grants.sql
-- PURPOSE: Grant missing privileges to service_role for communication tables.
-- ==============================================================================

BEGIN;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.domain_events_dlq TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_dispatches TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_metrics_projection TO service_role;

COMMIT;
