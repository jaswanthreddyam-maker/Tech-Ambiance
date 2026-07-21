-- =============================================================================
-- Migration: 20260721_portal_projection_state.sql
-- Description: Tracks persistent operational state for the Portal CQRS read models.
-- =============================================================================

CREATE TABLE portal_projection_state (
  projection_name TEXT PRIMARY KEY,
  last_processed_event UUID,
  last_processed_at TIMESTAMPTZ,
  rebuild_started_at TIMESTAMPTZ,
  rebuild_finished_at TIMESTAMPTZ,
  projection_version TEXT NOT NULL DEFAULT '1.0',
  is_rebuild_running BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert the global master state row
INSERT INTO portal_projection_state (projection_name, projection_version) 
VALUES ('master', '1.0');
