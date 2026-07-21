import { createClient } from "@supabase/supabase-js";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Runtime Metrics (Reset on restart)
 * In a real system, these would be exported to Prometheus/Datadog.
 */
export const RuntimeMetrics = {
  portal_projection_events_total: 0,
  portal_projection_failures_total: 0,
  portal_projection_lag_seconds: 0, // Calculated dynamically when queried
};

export class ProjectionMetrics {
  
  static recordEventSuccess(event: any) {
    RuntimeMetrics.portal_projection_events_total++;
    // Fire and forget state update
    this.updatePersistentState(event.id, event.created_at).catch(err => {
      console.error('Failed to update projection state:', err);
    });
  }

  static recordEventFailure(event: any, error: any) {
    RuntimeMetrics.portal_projection_failures_total++;
    console.error(`Projection failed for event ${event.id}:`, error);
  }

  static async updatePersistentState(eventId: string, eventTimestamp: string) {
    await supabase.from('portal_projection_state').upsert({
      projection_name: 'master',
      last_processed_event: eventId,
      last_processed_at: eventTimestamp,
      updated_at: new Date().toISOString()
    }, { onConflict: 'projection_name' });
  }

  static async markRebuildStart() {
    await supabase.from('portal_projection_state').upsert({
      projection_name: 'master',
      is_rebuild_running: true,
      rebuild_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'projection_name' });
  }

  static async markRebuildComplete() {
    await supabase.from('portal_projection_state').upsert({
      projection_name: 'master',
      is_rebuild_running: false,
      rebuild_finished_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'projection_name' });
  }
}
