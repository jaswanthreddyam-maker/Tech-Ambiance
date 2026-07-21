import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LeadConsultationPayload } from '../api/agencyOsService';

export interface CrmPipelineStage {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface CrmLead {
  id: string;
  lead_number: string;
  business_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  status: string;
  budget_range: string;
  timeline: string;
  lead_source: string;
  assigned_to: string | null;
  consultation_snapshot: any;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface LeadEvent {
  id: string;
  lead_id: string;
  event_type: string;
  payload: any;
  created_at: string;
}

export const crmRepository = {
  /**
   * Create a new lead via the SECURITY DEFINER RPC.
   * This handles deduplication and enforces the exact payload snapshot.
   */
  async createLead(payload: LeadConsultationPayload, idempotencyKey: string) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. CRM submissions are disabled.");
    }
    
    // Pass the payload directly to the RPC function
    const { data, error } = await supabase.rpc('create_consultation_lead', {
      payload: payload,
      idempotency_key: idempotencyKey,
    });

    if (error) {
      throw error;
    }

    return data as CrmLead;
  },

  /**
   * List all leads for the admin dashboard.
   */
  async listLeads(): Promise<CrmLead[]> {
    if (!isSupabaseConfigured) return [];
    
    const { data, error } = await supabase
      .from('lead_consultations')
      .select('*')
      .is('archived_at', null)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as CrmLead[];
  },

  /**
   * Subscribe to real-time changes on the leads table.
   * Supabase Realtime channel abstraction.
   */
  watchLeadPipeline(onUpdate: (payload: any) => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase.channel('crm_pipeline_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lead_consultations' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Retrieve the audit timeline for a specific lead.
   */
  async getLeadTimeline(leadId: string): Promise<LeadEvent[]> {
    if (!isSupabaseConfigured) return [];
    
    const { data, error } = await supabase
      .from('lead_events')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data as LeadEvent[];
  },

  /**
   * Change a lead's stage using optimistic concurrency (version checking).
   */
  async changeLeadStage(leadId: string, newStage: string, currentVersion: number) {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    
    const { data, error } = await supabase
      .from('lead_consultations')
      .update({ status: newStage })
      .eq('id', leadId)
      .eq('version', currentVersion)
      .select()
      .maybeSingle();
      
    if (error) throw error;
    return data as CrmLead;
  },

  /**
   * Soft archive a lead.
   */
  async archiveLead(leadId: string, currentVersion: number, adminId: string) {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    
    const { data, error } = await supabase
      .from('lead_consultations')
      .update({ 
        archived_at: new Date().toISOString(),
        archived_by: adminId 
      })
      .eq('id', leadId)
      .eq('version', currentVersion)
      .select()
      .maybeSingle();
      
    if (error) throw error;
    return data as CrmLead;
  }
};
