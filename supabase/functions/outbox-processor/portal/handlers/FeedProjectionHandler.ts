import { createClient } from "@supabase/supabase-js";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class FeedProjectionHandler {
  /**
   * Enforces the invariant: Every client-visible domain event must produce exactly one Feed Item.
   */
  static async handle(event: any) {
    if (!event.is_client_visible) return;

    // Idempotency check happens via ON CONFLICT on last_event_id or similar, 
    // but here we demonstrate the UPSERT logic for idempotency.
    
    let icon = 'CircleDashed';
    let priority = 'normal';
    let category = event.event_type;
    
    // Simple mapping based on event type
    switch (event.event_type) {
      case 'INVOICE_ISSUED':
        icon = 'DollarSign';
        priority = 'high';
        break;
      case 'DELIVERABLE_UPLOADED':
        icon = 'Upload';
        break;
      case 'MILESTONE_COMPLETED':
        icon = 'CheckCircle2';
        break;
    }

    const { error } = await supabase
      .from('portal_feed_projection')
      .upsert({
        project_id: event.project_id,
        icon,
        title: event.title || event.event_type,
        description: event.description || '',
        timestamp: event.created_at,
        priority,
        category,
        last_event_id: event.id,
        last_event_timestamp: event.created_at,
      }, { onConflict: 'last_event_id' }); // Ensures idempotency per event

    if (error) {
      console.error('Failed to project feed item:', error);
      throw error;
    }
  }
}
