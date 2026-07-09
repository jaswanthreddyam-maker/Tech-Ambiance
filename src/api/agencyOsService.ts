import { supabase, isSupabaseConfigured } from "../lib/supabase";

// ============================================================================
// TYPES & ENUMS FOR AGENCY OS BOUNDED CONTEXTS
// ============================================================================

export type LifecycleStage =
  | "DISCOVERY"
  | "PLANNING"
  | "DESIGN"
  | "DEVELOPMENT"
  | "QA"
  | "STAGING"
  | "PRODUCTION"
  | "MAINTENANCE"
  | "ARCHIVED";

export type DeliverableCategory =
  | "Brand Assets"
  | "Contracts"
  | "Deliverables"
  | "Reports"
  | "Credentials";

export interface LeadConsultationPayload {
  business_name: string;
  industry: string;
  website?: string;
  instagram?: string;
  city?: string;
  heard_source?: string;
  goals: string[];
  budget_range: string;
  timeline: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  preferred_contact: string;
  message?: string;
}

export interface ProjectHealthPayload {
  budget: string;
  timeline: string;
  scope: string;
  client_response: string;
}

// ============================================================================
// AGENCY OS SERVICE (CQRS COMMAND & QUERY ENGINE)
// ============================================================================

export const agencyOsService = {
  // --------------------------------------------------------------------------
  // 1. CRM BOUNDED CONTEXT
  // --------------------------------------------------------------------------
  crm: {
    async submitConsultationLead(payload: LeadConsultationPayload) {
      if (!isSupabaseConfigured) {
        console.warn("Supabase not configured; returning mock lead response.");
        return { data: { id: "mock-lead-id", ...payload, status: "PENDING_REVIEW" }, error: null };
      }
      const { data, error } = await supabase
        .from("lead_consultations")
        .insert([payload])
        .select()
        .single();
      return { data, error };
    },

    async listLeads(statusFilter?: string) {
      if (!isSupabaseConfigured) return { data: [], error: null };
      let query = supabase.from("lead_consultations").select("*").order("created_at", { ascending: false });
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      return await query;
    },

    async createProposal(payload: {
      deal_id: string;
      proposal_number: string;
      scope_summary: string;
      total_amount: number;
      advance_deposit_amount: number;
      expires_at: string;
    }) {
      if (!isSupabaseConfigured) return { data: { id: "mock-proposal-id", ...payload }, error: null };
      return await supabase.from("proposals").insert([payload]).select().single();
    },
  },

  // --------------------------------------------------------------------------
  // 2. FINANCE BOUNDED CONTEXT (GATEKEEPER)
  // --------------------------------------------------------------------------
  finance: {
    async listInvoices(organizationId?: string) {
      if (!isSupabaseConfigured) return { data: [], error: null };
      let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }
      return await query;
    },

    async issueInvoice(payload: {
      organization_id?: string;
      workspace_id?: string;
      invoice_number: string;
      title: string;
      amount: number;
      due_date: string;
    }) {
      if (!isSupabaseConfigured) return { data: { id: "mock-invoice-id", ...payload, status: "PENDING" }, error: null };
      return await supabase.from("invoices").insert([payload]).select().single();
    },

    async verifyPayment(invoiceId: string, actorUserId: string) {
      if (!isSupabaseConfigured) return { data: true, error: null };
      const { data, error } = await supabase
        .from("invoices")
        .update({ status: "PAID", paid_at: new Date().toISOString() })
        .eq("id", invoiceId)
        .select()
        .single();

      if (!error && data) {
        await agencyOsService.audit.logAdminAction({
          actor_user_id: actorUserId,
          action_type: "INVOICE_PAID_VERIFIED",
          target_entity_type: "Invoice",
          target_entity_id: invoiceId,
          new_state: { status: "PAID", amount: data.amount },
        });
      }
      return { data, error };
    },
  },

  // --------------------------------------------------------------------------
  // 3. DELIVERY BOUNDED CONTEXT
  // --------------------------------------------------------------------------
  delivery: {
    async listWorkspaceProjects(workspaceId: string) {
      if (!isSupabaseConfigured) return { data: [], error: null };
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          milestones(*),
          deliverable_files(*),
          timeline_events(*)
        `)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });
      return { data, error };
    },

    async completeMilestone(milestoneId: string, projectId: string, milestoneTitle: string, actorUserId: string) {
      if (!isSupabaseConfigured) return { data: true, error: null };
      const { data, error } = await supabase
        .from("milestones")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", milestoneId)
        .select()
        .single();

      if (!error) {
        // Automatically emit Domain Event to Client Timeline
        await agencyOsService.communication.appendTimelineEvent({
          project_id: projectId,
          event_title: "Milestone Completed",
          description: `Deliverable signed off: ${milestoneTitle}`,
          category: "Milestone",
          visibility: "CLIENT",
        });

        // Audit Log
        await agencyOsService.audit.logAdminAction({
          actor_user_id: actorUserId,
          action_type: "MILESTONE_COMPLETED",
          target_entity_type: "Milestone",
          target_entity_id: milestoneId,
          new_state: { status: "completed", title: milestoneTitle },
        });
      }
      return { data, error };
    },

    async updateProjectLifecycleStage(projectId: string, newStage: LifecycleStage, actorUserId: string) {
      if (!isSupabaseConfigured) return { data: true, error: null };
      const { data, error } = await supabase
        .from("projects")
        .update({ lifecycle_stage: newStage, updated_at: new Date().toISOString() })
        .eq("id", projectId)
        .select()
        .single();

      if (!error) {
        await agencyOsService.communication.appendTimelineEvent({
          project_id: projectId,
          event_title: "Lifecycle Stage Transition",
          description: `Project advanced to ${newStage} phase.`,
          category: "Milestone",
          visibility: "CLIENT",
        });

        await agencyOsService.audit.logAdminAction({
          actor_user_id: actorUserId,
          action_type: "STAGE_TRANSITION",
          target_entity_type: "Project",
          target_entity_id: projectId,
          new_state: { lifecycle_stage: newStage },
        });
      }
      return { data, error };
    },
  },

  // --------------------------------------------------------------------------
  // 4. COMMUNICATION BOUNDED CONTEXT
  // --------------------------------------------------------------------------
  communication: {
    async appendTimelineEvent(payload: {
      project_id: string;
      event_title: string;
      description: string;
      category: "Deployment" | "Milestone" | "Finance" | "Design" | "Internal";
      visibility: "CLIENT" | "INTERNAL";
    }) {
      if (!isSupabaseConfigured) return { data: null, error: null };
      return await supabase.from("timeline_events").insert([payload]).select().single();
    },

    async listClientJourneyEvents(organizationId: string) {
      if (!isSupabaseConfigured) return { data: [], error: null };
      return await supabase
        .from("client_journey_events")
        .select("*")
        .eq("organization_id", organizationId)
        .order("display_order", { ascending: true });
    },
  },

  // --------------------------------------------------------------------------
  // 5. ASSETS BOUNDED CONTEXT
  // --------------------------------------------------------------------------
  assets: {
    async registerDeliverableFile(payload: {
      project_id: string;
      milestone_id?: string;
      file_name: string;
      version_tag: "v1" | "v2" | "Final";
      category: DeliverableCategory;
      file_size: string;
      file_type: string;
      storage_path: string;
      uploaded_by?: string;
    }) {
      if (!isSupabaseConfigured) return { data: { id: "mock-file-id", ...payload }, error: null };
      const { data, error } = await supabase.from("deliverable_files").insert([payload]).select().single();

      if (!error && data) {
        await agencyOsService.communication.appendTimelineEvent({
          project_id: payload.project_id,
          event_title: `New Deliverable Uploaded (${payload.version_tag})`,
          description: `File added to ${payload.category}: ${payload.file_name}`,
          category: "Design",
          visibility: "CLIENT",
        });
      }
      return { data, error };
    },
  },

  // --------------------------------------------------------------------------
  // 6. AUDIT BOUNDED CONTEXT
  // --------------------------------------------------------------------------
  audit: {
    async logAdminAction(payload: {
      actor_user_id: string;
      action_type: string;
      target_entity_type: string;
      target_entity_id: string;
      old_state?: Record<string, any>;
      new_state?: Record<string, any>;
    }) {
      if (!isSupabaseConfigured) return { data: null, error: null };
      return await supabase.from("admin_audit_logs").insert([payload]);
    },
  },
};
