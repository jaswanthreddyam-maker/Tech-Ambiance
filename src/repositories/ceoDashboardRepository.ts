import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ceoDashboardRepository = {
  // Independent Fetches for Widgets
  async getFinanceMetrics() {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('finance_dashboard_projection').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') console.error('Finance error:', error);
    return data;
  },

  async getDeliveryMetrics() {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('delivery_dashboard_projection').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') console.error('Delivery error:', error);
    return data;
  },

  async getCrmMetrics() {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('crm_dashboard_projection').select('*').eq('id', 1).single();
    if (error && error.code !== 'PGRST116') console.error('CRM error:', error);
    return data;
  },

  async getTopProjects() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('top_projects_projection')
      .select('*')
      .order('last_activity_at', { ascending: false })
      .limit(5);
    if (error) console.error('Top projects error:', error);
    return data || [];
  },

  async getStudioTimeline() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase
      .from('studio_activity_projection')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) console.error('Timeline error:', error);
    return data || [];
  },

  async getOperationsHealth() {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('operations_health_projection').select('*').order('context_name');
    if (error) console.error('Health error:', error);
    return data || [];
  },

  /**
   * Aggregate all dashboard projections into a single executive report object.
   * The UI layer only calls this and triggers a download — format logic stays here.
   */
  async getExecutiveReport(): Promise<string> {
    const [finance, delivery, crm, topProjects, health] = await Promise.all([
      this.getFinanceMetrics(),
      this.getDeliveryMetrics(),
      this.getCrmMetrics(),
      this.getTopProjects(),
      this.getOperationsHealth(),
    ]);

    const lines: string[] = [];

    // Header
    lines.push('Section,Metric,Value');

    // Finance
    lines.push(`Finance,Monthly Revenue (USD),"${finance?.monthly_revenue?.toLocaleString() ?? 'N/A'}"`);
    lines.push(`Finance,Cash Collected This Month,"${finance?.cash_collected_this_month?.toLocaleString() ?? 'N/A'}"`);
    lines.push(`Finance,Overdue Invoice Count,${finance?.overdue_invoice_count ?? 'N/A'}`);

    // CRM
    lines.push(`CRM,Pipeline Value,"${crm?.pipeline_value?.toLocaleString() ?? 'N/A'}"`);
    lines.push(`CRM,Open Deals,${crm?.open_deals ?? 'N/A'}`);
    lines.push(`CRM,Deals Won,${crm?.deals_won ?? 'N/A'}`);

    // Delivery
    lines.push(`Delivery,Avg Milestone Completion (Days),${delivery?.average_milestone_completion_days ?? 'N/A'}`);
    lines.push(`Delivery,Active Workspaces,${delivery?.active_workspaces ?? 'N/A'}`);
    lines.push(`Delivery,Projects At Risk,${delivery?.projects_at_risk ?? 'N/A'}`);

    // Top Projects
    topProjects.forEach((p: any, idx: number) => {
      lines.push(`Top Project #${idx + 1},${p.project_name ?? 'Unknown'},Stage: ${p.lifecycle_stage ?? 'N/A'} | Health: ${p.health_status ?? 'N/A'}`);
    });

    // Operations Health
    (health || []).forEach((h: any) => {
      lines.push(`Operations,${h.context_name},Status: ${h.status} | Lag: ${h.outbox_lag ?? 0}`);
    });

    return lines.join('\n');
  },

  // Realtime Subscriptions
  initializeRealtime(callbacks: {
    onFinanceUpdate?: (payload: any) => void;
    onDeliveryUpdate?: (payload: any) => void;
    onCrmUpdate?: (payload: any) => void;
    onTimelineUpdate?: (payload: any) => void;
  }) {
    if (!isSupabaseConfigured) return null;
    
    // Create a unique channel for each widget to prevent subscription conflicts
    const channelId = `dashboard-projections-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase.channel(channelId);

    if (callbacks.onFinanceUpdate) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'finance_dashboard_projection' }, payload => {
        callbacks.onFinanceUpdate!(payload.new);
      });
    }

    if (callbacks.onDeliveryUpdate) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_dashboard_projection' }, payload => {
        callbacks.onDeliveryUpdate!(payload.new);
      });
    }

    if (callbacks.onCrmUpdate) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'crm_dashboard_projection' }, payload => {
        callbacks.onCrmUpdate!(payload.new);
      });
    }

    if (callbacks.onTimelineUpdate) {
      channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'studio_activity_projection' }, payload => {
        callbacks.onTimelineUpdate!(payload.new);
      });
    }

    return channel.subscribe();
  },

  disposeRealtime(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};
