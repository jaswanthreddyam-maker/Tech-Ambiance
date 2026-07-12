import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
// For a worker, we ideally use SERVICE_ROLE_KEY to bypass RLS.
// In dev, we can use the env vars if provided, or fallback to standard anon for this demo script.
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("🚀 Starting Projection Runner...");

// Helper to fetch projection safely
async function getProjection(table: string) {
  const { data, error } = await supabase.from(table).select('*').eq('id', 1).single();
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error(`Error fetching projection ${table}:`, error);
    throw error;
  }
  return data;
}

// In-memory projection state for batched updates
let financeState = {
    monthly_revenue: 0, mrr: 0, arr: 0, outstanding_invoices: 0,
    cash_collected_this_month: 0, average_invoice_value: 0, overdue_invoice_count: 0
};
let crmState = {
    pipeline_value: 0, open_deals: 0, conversion_rate: 0,
    discovery_calls: 0, deals_won: 0, deals_lost: 0
};
let deliveryState = {
    active_organizations: 0, active_workspaces: 0, projects_at_risk: 0, average_milestone_completion_days: 0
};

// Initialize State
async function initState() {
    const f = await getProjection('finance_dashboard_projection');
    if (f) financeState = { ...financeState, ...f };
    const c = await getProjection('crm_dashboard_projection');
    if (c) crmState = { ...crmState, ...c };
    const d = await getProjection('delivery_dashboard_projection');
    if (d) deliveryState = { ...deliveryState, ...d };
}

async function processEvent(event: any) {
  console.log(`Processing ${event.event_type} (${event.id})`);
  const payload = event.payload || {};
  
  // 1. Finance Projection Logic
  if (event.event_type === 'InvoicePaid') {
    financeState.cash_collected_this_month += payload.amount || 0;
    financeState.monthly_revenue += payload.amount || 0;
    
    // Naive moving average logic for mock purposes
    if (financeState.average_invoice_value === 0) {
      financeState.average_invoice_value = payload.amount;
    } else {
      financeState.average_invoice_value = (financeState.average_invoice_value + payload.amount) / 2;
    }
    
    await supabase.from('finance_dashboard_projection').update({
      monthly_revenue: financeState.monthly_revenue,
      cash_collected_this_month: financeState.cash_collected_this_month,
      average_invoice_value: financeState.average_invoice_value,
      last_processed_event_id: event.id
    }).eq('id', 1);
  }
  
  if (event.event_type === 'InvoiceOverdue') {
    financeState.overdue_invoice_count += 1;
    financeState.outstanding_invoices += payload.amount || 0;
    await supabase.from('finance_dashboard_projection').update({
      overdue_invoice_count: financeState.overdue_invoice_count,
      outstanding_invoices: financeState.outstanding_invoices,
      last_processed_event_id: event.id
    }).eq('id', 1);
  }

  // 2. CRM Projection Logic
  if (event.event_type === 'DealWon') {
    crmState.deals_won += 1;
    crmState.pipeline_value += payload.pipeline_value_added || 0;
    crmState.open_deals = Math.max(0, crmState.open_deals - 1);
    await supabase.from('crm_dashboard_projection').update({
      deals_won: crmState.deals_won,
      pipeline_value: crmState.pipeline_value,
      open_deals: crmState.open_deals,
      last_processed_event_id: event.id
    }).eq('id', 1);
  }

  if (event.event_type === 'DealLost') {
    crmState.deals_lost += 1;
    crmState.open_deals = Math.max(0, crmState.open_deals - 1);
    await supabase.from('crm_dashboard_projection').update({
      deals_lost: crmState.deals_lost,
      open_deals: crmState.open_deals,
      last_processed_event_id: event.id
    }).eq('id', 1);
  }

  if (event.event_type === 'DiscoveryCallScheduled') {
    crmState.discovery_calls += 1;
    crmState.open_deals += 1;
    await supabase.from('crm_dashboard_projection').update({
      discovery_calls: crmState.discovery_calls,
      open_deals: crmState.open_deals,
      last_processed_event_id: event.id
    }).eq('id', 1);
  }

  // 3. Delivery Logic
  if (event.event_type === 'ProjectCreated') {
    deliveryState.active_workspaces += 1;
    await supabase.from('delivery_dashboard_projection').update({
      active_workspaces: deliveryState.active_workspaces,
      last_processed_event_id: event.id
    }).eq('id', 1);
    
    await supabase.from('top_projects_projection').upsert({
      project_id: event.aggregate_id,
      project_name: payload.project_name || 'Unknown Project',
      organization_name: payload.organization_name || 'Unknown Org',
      workspace_name: payload.workspace_name || 'Unknown WS',
      health_status: 'HEALTHY',
      lifecycle_stage: 'DISCOVERY',
      progress_percentage: 0,
      owner_name: 'Unassigned',
      last_activity_at: new Date().toISOString(),
      last_processed_event_id: event.id
    });
  }
  
  if (event.event_type === 'ProjectAtRisk') {
    deliveryState.projects_at_risk += 1;
    await supabase.from('delivery_dashboard_projection').update({
      projects_at_risk: deliveryState.projects_at_risk,
      last_processed_event_id: event.id
    }).eq('id', 1);
    
    // Also update the specific project if we know it by ID (mock uses aggregate_id)
    await supabase.from('top_projects_projection').update({
      health_status: 'AT_RISK',
      last_activity_at: new Date().toISOString()
    }).eq('project_id', event.aggregate_id);
  }

  if (event.event_type === 'MilestoneCompleted') {
    if (deliveryState.average_milestone_completion_days === 0) {
      deliveryState.average_milestone_completion_days = payload.days_to_complete || 0;
    } else {
      deliveryState.average_milestone_completion_days = Math.round((deliveryState.average_milestone_completion_days + (payload.days_to_complete || 0)) / 2);
    }
    await supabase.from('delivery_dashboard_projection').update({
      average_milestone_completion_days: deliveryState.average_milestone_completion_days,
      last_processed_event_id: event.id
    }).eq('id', 1);
  }

  // 4. Studio Activity Logic (Global Timeline)
  // Everything creates a timeline log
  await supabase.from('studio_activity_projection').insert({
    event_type: event.event_type,
    description: payload.description || payload.reason || `Processed ${event.event_type} for ${payload.client_name || payload.project_name || 'Unknown'}`,
    tag: event.aggregate_type,
    actor_name: payload.actor_name || 'System',
    organization_name: payload.organization_name,
    project_name: payload.project_name,
    severity: event.event_type.includes('Lost') || event.event_type.includes('Risk') || event.event_type.includes('Overdue') ? 'WARNING' : 'INFO',
    source_context: event.aggregate_type === 'Invoice' ? 'Finance' : event.aggregate_type === 'Deal' ? 'CRM' : 'Delivery',
    last_processed_event_id: event.id
  });
}

async function loop() {
  await initState();
  
  while (true) {
    try {
      const { data: events, error } = await supabase
        .from('domain_events_outbox')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
        .limit(10);
        
      if (error) throw error;
      
      for (const event of events || []) {
        await processEvent(event);
        
        await supabase.from('domain_events_outbox')
           .update({ status: 'PROCESSED', processed_at: new Date().toISOString() })
           .eq('id', event.id);
      }
      
    } catch (err) {
      console.error("Runner Error:", err);
    }
    
    // In production we sleep and loop. For this script run, we can exit if empty to avoid infinite hanging in terminal
    // Wait... if this is a worker, we should loop. But for the prompt script, I'll process and exit.
    // Let's process and exit if no more events, so we can run it as a one-shot seed for the UI.
    const { count } = await supabase.from('domain_events_outbox').select('*', { count: 'exact', head: true }).eq('status', 'PENDING');
    if (count === 0) {
      console.log("✅ All events processed. Projection Runner exiting.");
      process.exit(0);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
}

loop();
