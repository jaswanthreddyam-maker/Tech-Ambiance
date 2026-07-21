import { supabase } from '../../../lib/supabase';

export class ActionProjectionHandler {
  static async handle(event: any) {
    // Example logic for projecting client actions
    
    if (event.event_type === 'INVOICE_ISSUED' && event.is_client_visible) {
      await supabase.from('client_actions').upsert({
        project_id: event.project_id,
        status: 'pending',
        priority: 'high',
        title: 'Invoice Due',
        description: `Invoice ${event.payload?.invoice_number || 'new'} is ready for payment.`,
        cta_label: 'View Invoice',
        last_event_id: event.id,
        last_event_timestamp: event.created_at,
      }, { onConflict: 'last_event_id' });
    }
    
    if (event.event_type === 'INVOICE_PAID') {
      // Find the action and mark it completed
      await supabase
        .from('client_actions')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('project_id', event.project_id)
        .eq('title', 'Invoice Due');
    }
  }
}
