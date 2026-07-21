import { createClient } from "@supabase/supabase-js";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class BillingProjectionHandler {
  static async handle(event: any) {
    // Only care about billing events
    if (event.event_type !== 'INVOICE_ISSUED' && event.event_type !== 'INVOICE_PAID') return;
    
    const orgId = event.payload?.organization_id;
    if (!orgId) return;

    await supabase.from('portal_billing_projection').upsert({
      organization_id: orgId,
      last_event_id: event.id,
      last_event_timestamp: event.created_at,
      updated_at: new Date().toISOString()
    }, { onConflict: 'organization_id' });
  }
}
