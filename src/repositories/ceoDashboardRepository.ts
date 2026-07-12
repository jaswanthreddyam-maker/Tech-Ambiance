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

  // Realtime Subscriptions
  initializeRealtime(callbacks: {
    onFinanceUpdate?: (payload: any) => void;
    onDeliveryUpdate?: (payload: any) => void;
    onCrmUpdate?: (payload: any) => void;
    onTimelineUpdate?: (payload: any) => void;
  }) {
    if (!isSupabaseConfigured) return null;
    
    return supabase.channel('dashboard-projections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finance_dashboard_projection' }, payload => {
        if (callbacks.onFinanceUpdate) callbacks.onFinanceUpdate(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'delivery_dashboard_projection' }, payload => {
        if (callbacks.onDeliveryUpdate) callbacks.onDeliveryUpdate(payload.new);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crm_dashboard_projection' }, payload => {
        if (callbacks.onCrmUpdate) callbacks.onCrmUpdate(payload.new);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'studio_activity_projection' }, payload => {
        if (callbacks.onTimelineUpdate) callbacks.onTimelineUpdate(payload.new);
      })
      .subscribe();
  },

  disposeRealtime(channel: any) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  }
};
