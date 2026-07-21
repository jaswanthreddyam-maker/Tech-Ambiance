// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
import { EventRouter } from "./router/EventRouter.ts";
import { StudioInvitationCreatedHandler } from "./handlers/StudioInvitationCreatedHandler.ts";
import { StudioInvitationSentProjection } from "./handlers/StudioInvitationSentProjection.ts";
import { PortalProjectionDispatcher } from "./portal/PortalProjectionDispatcher.ts";
import { RuntimeMetrics } from "./portal/ProjectionMetrics.ts";
import { DomainEvent } from "./types.ts";

const router = new EventRouter();

// Register Handlers
router.register("StudioInvitationCreated", new StudioInvitationCreatedHandler());
router.register("StudioInvitationSent", new StudioInvitationSentProjection());

serve(async (req: Request) => {
  const pathname = new URL(req.url).pathname;
  if (req.method === "GET" && (pathname.endsWith("/health") || pathname.endsWith("/api/v1/portal/health"))) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: state } = await supabase
      .from('portal_projection_state')
      .select('*')
      .eq('projection_name', 'master')
      .single();

    return new Response(JSON.stringify({
      status: "healthy",
      projection_version: state?.projection_version || "1.0",
      last_processed_event: state?.last_processed_event || null,
      last_processed_at: state?.last_processed_at || null,
      lag_seconds: RuntimeMetrics.portal_projection_lag_seconds,
      pending_events: 0,
      rebuild_running: state?.is_rebuild_running || false,
      rebuild_required: false,
      failed_handlers: RuntimeMetrics.portal_projection_failures_total > 0 ? ['unknown'] : [],
      repositories: {
        active: "projection"
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Claim a batch of events
    const { data: events, error: claimError } = await supabase.rpc("claim_domain_events", {
      p_batch_size: 10,
    });

    if (claimError) {
      console.error("Failed to claim events:", claimError);
      return new Response(JSON.stringify({ error: claimError.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Process each event
    for (const event of (events as DomainEvent[])) {
      try {
        await router.route(event);
        
        // Feed into Portal Projections natively
        await PortalProjectionDispatcher.dispatch(event);

        // Mark Success
        await supabase.rpc("complete_domain_event", {
          p_id: event.id,
          p_success: true,
        });

        successCount++;
      } catch (err: any) {
        console.error(`Error processing event ${event.id}:`, err);
        // Mark Failure (Backoff / DLQ handled inside RPC)
        await supabase.rpc("complete_domain_event", {
          p_id: event.id,
          p_success: false,
          p_error: err.message || "Unknown error",
        });
        
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({ processed: events.length, success: successCount, failed: failCount }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Outbox Processor fatal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
