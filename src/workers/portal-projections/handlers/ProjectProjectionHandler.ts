import { supabase } from '../../../lib/supabase';

export class ProjectProjectionHandler {
  static async handle(event: any) {
    if (!event.project_id) return;

    if (event.event_type === 'DELIVERABLE_UPLOADED') {
      await supabase.from('portal_project_deliverables_projection').upsert({
        project_id: event.project_id,
        deliverable_id: event.payload.deliverable_id || event.id,
        file_name: event.payload.file_name || 'Document',
        storage_path: event.payload.storage_path || '#',
      }, { onConflict: 'project_id, deliverable_id' });
      
      // Update count
      await supabase.rpc('increment_project_deliverables', { p_project_id: event.project_id });
    }
  }
}
