-- ==============================================================================
-- MIGRATION: 0016_communication_pipeline.sql
-- PURPOSE: Extends the domain events outbox with exponential backoff, DLQ, 
--          idempotency dispatches, and metrics projections.
-- ==============================================================================

BEGIN;

-- 1. Extend domain_events_outbox for exponential backoff
ALTER TABLE public.domain_events_outbox 
ADD COLUMN IF NOT EXISTS max_attempts INTEGER NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create an index to quickly find pending events ready for processing
CREATE INDEX IF NOT EXISTS idx_outbox_pending_retry 
ON public.domain_events_outbox(status, next_retry_at)
WHERE status IN ('PENDING', 'FAILED');

-- 2. Create Dead Letter Queue (DLQ)
CREATE TABLE IF NOT EXISTS public.domain_events_dlq (
  id UUID PRIMARY KEY, -- Original event ID
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempts INTEGER NOT NULL,
  last_error TEXT,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL -- Original creation time
);

-- 3. Idempotency Layer for Notifications
CREATE TABLE IF NOT EXISTS public.notification_dispatches (
  event_id UUID PRIMARY KEY REFERENCES public.domain_events_outbox(id) ON DELETE CASCADE,
  channel TEXT NOT NULL, -- e.g., 'Email', 'SMS'
  provider TEXT NOT NULL, -- e.g., 'Resend', 'Twilio'
  provider_message_id TEXT NOT NULL,
  status TEXT NOT NULL, -- e.g., 'DELIVERED', 'BOUNCED'
  latency_ms INTEGER,
  dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Communication Metrics Projection
CREATE TABLE IF NOT EXISTS public.communication_metrics_projection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  emails_sent INTEGER NOT NULL DEFAULT 0,
  emails_failed INTEGER NOT NULL DEFAULT 0,
  average_latency_ms INTEGER NOT NULL DEFAULT 0,
  total_latency_ms BIGINT NOT NULL DEFAULT 0,
  provider_failures INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_communication_metrics_org ON public.communication_metrics_projection(organization_id);

-- 5. RPC: Claim Domain Events
-- Safely fetches and locks the next batch of pending events for processing
CREATE OR REPLACE FUNCTION claim_domain_events(p_batch_size INTEGER)
RETURNS SETOF public.domain_events_outbox AS $$
BEGIN
  RETURN QUERY
  WITH locked_events AS (
    SELECT id
    FROM public.domain_events_outbox
    WHERE status IN ('PENDING', 'FAILED')
      AND next_retry_at <= NOW()
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  )
  UPDATE public.domain_events_outbox outbox
  SET status = 'PROCESSING'
  FROM locked_events
  WHERE outbox.id = locked_events.id
  RETURNING outbox.*;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: Complete Domain Event
-- Marks success, or increments attempts, manages backoff, and moves to DLQ
CREATE OR REPLACE FUNCTION complete_domain_event(
  p_id UUID,
  p_success BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_event public.domain_events_outbox;
  v_next_retry INTERVAL;
BEGIN
  SELECT * INTO v_event FROM public.domain_events_outbox WHERE id = p_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event % not found', p_id;
  END IF;

  IF p_success THEN
    UPDATE public.domain_events_outbox
    SET status = 'PROCESSED',
        processed_at = NOW(),
        last_error = NULL
    WHERE id = p_id;
  ELSE
    -- Failure Handling
    IF v_event.attempts + 1 >= v_event.max_attempts THEN
      -- Move to DLQ
      INSERT INTO public.domain_events_dlq (
        id, aggregate_type, aggregate_id, event_type, payload, attempts, last_error, created_at
      ) VALUES (
        v_event.id, v_event.aggregate_type, v_event.aggregate_id, v_event.event_type,
        v_event.payload, v_event.attempts + 1, p_error, v_event.created_at
      );
      DELETE FROM public.domain_events_outbox WHERE id = p_id;
    ELSE
      -- Calculate Exponential Backoff
      -- Attempt 1 -> 30s, Attempt 2 -> 2m (120s), Attempt 3 -> 10m (600s), Attempt 4 -> 30m
      v_next_retry := CASE v_event.attempts + 1
        WHEN 1 THEN INTERVAL '30 seconds'
        WHEN 2 THEN INTERVAL '2 minutes'
        WHEN 3 THEN INTERVAL '10 minutes'
        ELSE INTERVAL '30 minutes'
      END;

      UPDATE public.domain_events_outbox
      SET status = 'FAILED',
          attempts = attempts + 1,
          last_error = p_error,
          next_retry_at = NOW() + v_next_retry
      WHERE id = p_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Config
ALTER TABLE public.domain_events_dlq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_metrics_projection ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.domain_events_dlq TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_dispatches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_metrics_projection TO authenticated;

COMMIT;
