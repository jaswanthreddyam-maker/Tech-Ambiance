import { supabase } from '../../../lib/supabase';

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
