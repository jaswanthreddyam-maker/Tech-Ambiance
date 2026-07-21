import { createClient } from "@supabase/supabase-js";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class HomeProjectionHandler {
  static async handle(event: any) {
    if (!event.project_id) return;
    
    // We only update if this is a project-related event
    const { error } = await supabase.from('portal_home_projection').upsert({
      project_id: event.project_id,
      // In a real system, you'd aggregate the current state (e.g. from milestones)
      // For idempotency, we update the timestamp. If fields haven't changed, 
      // Postgres handles it cleanly or we do a read-modify-write.
      last_event_id: event.id,
      last_event_timestamp: event.created_at,
      updated_at: new Date().toISOString()
    }, { onConflict: 'project_id' });

    if (error) {
      console.error('HomeProjectionHandler error:', error);
    }
  }
}
