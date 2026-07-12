export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action_type: string
          actor_user_id: string
          created_at: string
          id: string
          new_state: Json | null
          old_state: Json | null
          target_entity_id: string
          target_entity_type: string
        }
        Insert: {
          action_type: string
          actor_user_id: string
          created_at?: string
          id?: string
          new_state?: Json | null
          old_state?: Json | null
          target_entity_id: string
          target_entity_type: string
        }
        Update: {
          action_type?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          new_state?: Json | null
          old_state?: Json | null
          target_entity_id?: string
          target_entity_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_pin_history: {
        Row: {
          changed_at: string
          id: string
          pin_hash: string
          user_id: string
        }
        Insert: {
          changed_at?: string
          id?: string
          pin_hash: string
          user_id: string
        }
        Update: {
          changed_at?: string
          id?: string
          pin_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_pin_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_security: {
        Row: {
          failed_attempts: number
          locked_until: string | null
          pin_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          failed_attempts?: number
          locked_until?: string | null
          pin_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          failed_attempts?: number
          locked_until?: string | null
          pin_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_security_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string
          browser: string | null
          country: string | null
          id: string
          ip_address: string | null
          is_trusted: boolean
          last_seen: string
          login_time: string
          os: string | null
          session_id: string
        }
        Insert: {
          admin_id: string
          browser?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean
          last_seen?: string
          login_time?: string
          os?: string | null
          session_id: string
        }
        Update: {
          admin_id?: string
          browser?: string | null
          country?: string | null
          id?: string
          ip_address?: string | null
          is_trusted?: boolean
          last_seen?: string
          login_time?: string
          os?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          role?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      auth_rate_limits: {
        Row: {
          attempt_type: string
          created_at: string
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      client_activations: {
        Row: {
          activated_at: string
          activated_by: string | null
          activation_method: string
          activation_source: string
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          portal_visibility: string
          workspace_id: string
        }
        Insert: {
          activated_at?: string
          activated_by?: string | null
          activation_method: string
          activation_source: string
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          portal_visibility: string
          workspace_id: string
        }
        Update: {
          activated_at?: string
          activated_by?: string | null
          activation_method?: string
          activation_source?: string
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          portal_visibility?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_activations_activated_by_fkey"
            columns: ["activated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_activations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      client_journey_events: {
        Row: {
          created_at: string
          display_order: number
          event_date: string
          id: string
          organization_id: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          event_date: string
          id?: string
          organization_id: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          display_order?: number
          event_date?: string
          id?: string
          organization_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_journey_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      command_idempotency: {
        Row: {
          admin_id: string
          created_at: string
          idempotency_key: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          idempotency_key: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          idempotency_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "command_idempotency_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_metrics_projection: {
        Row: {
          average_latency_ms: number
          emails_failed: number
          emails_sent: number
          id: string
          organization_id: string
          provider_failures: number
          total_latency_ms: number
          updated_at: string
        }
        Insert: {
          average_latency_ms?: number
          emails_failed?: number
          emails_sent?: number
          id?: string
          organization_id: string
          provider_failures?: number
          total_latency_ms?: number
          updated_at?: string
        }
        Update: {
          average_latency_ms?: number
          emails_failed?: number
          emails_sent?: number
          id?: string
          organization_id?: string
          provider_failures?: number
          total_latency_ms?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_metrics_projection_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_number: string
          created_at: string
          file_url: string | null
          id: string
          organization_id: string
          signed_at: string | null
          status: string
          title: string
        }
        Insert: {
          contract_number: string
          created_at?: string
          file_url?: string | null
          id?: string
          organization_id: string
          signed_at?: string | null
          status?: string
          title?: string
        }
        Update: {
          contract_number?: string
          created_at?: string
          file_url?: string | null
          id?: string
          organization_id?: string
          signed_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_dashboard_projection: {
        Row: {
          conversion_rate: number | null
          deals_lost: number | null
          deals_won: number | null
          discovery_calls: number | null
          id: number
          last_processed_event_id: string | null
          open_deals: number | null
          pipeline_value: number | null
          projection_version: number | null
          updated_at: string | null
        }
        Insert: {
          conversion_rate?: number | null
          deals_lost?: number | null
          deals_won?: number | null
          discovery_calls?: number | null
          id?: number
          last_processed_event_id?: string | null
          open_deals?: number | null
          pipeline_value?: number | null
          projection_version?: number | null
          updated_at?: string | null
        }
        Update: {
          conversion_rate?: number | null
          deals_lost?: number | null
          deals_won?: number | null
          discovery_calls?: number | null
          id?: number
          last_processed_event_id?: string | null
          open_deals?: number | null
          pipeline_value?: number | null
          projection_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_pipeline_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color: string
          created_at?: string
          id: string
          name: string
          sort_order: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      crm_stage_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          duration_seconds: number | null
          from_stage_id: string | null
          id: string
          lead_id: string
          to_stage_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          duration_seconds?: number | null
          from_stage_id?: string | null
          id?: string
          lead_id: string
          to_stage_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          duration_seconds?: number | null
          from_stage_id?: string | null
          id?: string
          lead_id?: string
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_stage_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stage_history_from_stage_id_fkey"
            columns: ["from_stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stage_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_stage_history_to_stage_id_fkey"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          assigned_to: string | null
          created_at: string
          currency: string
          estimated_value: number
          id: string
          lead_id: string
          stage: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          currency?: string
          estimated_value?: number
          id?: string
          lead_id: string
          stage?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          currency?: string
          estimated_value?: number
          id?: string
          lead_id?: string
          stage?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_files: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_size: string
          file_type: string
          id: string
          milestone_id: string | null
          project_id: string
          storage_path: string
          uploaded_by: string | null
          version_tag: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_name: string
          file_size: string
          file_type: string
          id?: string
          milestone_id?: string | null
          project_id: string
          storage_path: string
          uploaded_by?: string | null
          version_tag?: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_size?: string
          file_type?: string
          id?: string
          milestone_id?: string | null
          project_id?: string
          storage_path?: string
          uploaded_by?: string | null
          version_tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_files_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_dashboard_projection: {
        Row: {
          active_organizations: number | null
          active_workspaces: number | null
          average_milestone_completion_days: number | null
          id: number
          last_processed_event_id: string | null
          projection_version: number | null
          projects_at_risk: number | null
          updated_at: string | null
        }
        Insert: {
          active_organizations?: number | null
          active_workspaces?: number | null
          average_milestone_completion_days?: number | null
          id?: number
          last_processed_event_id?: string | null
          projection_version?: number | null
          projects_at_risk?: number | null
          updated_at?: string | null
        }
        Update: {
          active_organizations?: number | null
          active_workspaces?: number | null
          average_milestone_completion_days?: number | null
          id?: number
          last_processed_event_id?: string | null
          projection_version?: number | null
          projects_at_risk?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      domain_events_dlq: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempts: number
          created_at: string
          event_type: string
          failed_at: string
          id: string
          last_error: string | null
          payload: Json
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempts: number
          created_at: string
          event_type: string
          failed_at?: string
          id: string
          last_error?: string | null
          payload: Json
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempts?: number
          created_at?: string
          event_type?: string
          failed_at?: string
          id?: string
          last_error?: string | null
          payload?: Json
        }
        Relationships: []
      }
      domain_events_outbox: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempts: number
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string
          payload: Json
          processed_at: string | null
          status: string
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempts?: number
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string
          payload: Json
          processed_at?: string | null
          status?: string
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempts?: number
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string
          payload?: Json
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      executive_sessions: {
        Row: {
          absolute_expires_at: string
          created_at: string
          device_fingerprint: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_activity_at: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          absolute_expires_at: string
          created_at?: string
          device_fingerprint?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          absolute_expires_at?: string
          created_at?: string
          device_fingerprint?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "executive_sessions_revoked_by_fkey"
            columns: ["revoked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "executive_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_dashboard_projection: {
        Row: {
          arr: number | null
          average_invoice_value: number | null
          cash_collected_this_month: number | null
          growth_percentage: number | null
          id: number
          last_processed_event_id: string | null
          monthly_revenue: number | null
          mrr: number | null
          outstanding_invoices: number | null
          overdue_invoice_count: number | null
          projection_version: number | null
          updated_at: string | null
        }
        Insert: {
          arr?: number | null
          average_invoice_value?: number | null
          cash_collected_this_month?: number | null
          growth_percentage?: number | null
          id?: number
          last_processed_event_id?: string | null
          monthly_revenue?: number | null
          mrr?: number | null
          outstanding_invoices?: number | null
          overdue_invoice_count?: number | null
          projection_version?: number | null
          updated_at?: string | null
        }
        Update: {
          arr?: number | null
          average_invoice_value?: number | null
          cash_collected_this_month?: number | null
          growth_percentage?: number | null
          id?: number
          last_processed_event_id?: string | null
          monthly_revenue?: number | null
          mrr?: number | null
          outstanding_invoices?: number | null
          overdue_invoice_count?: number | null
          projection_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role_id: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role_id: string
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role_id?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string
          id: string
          invoice_number: string
          organization_id: string | null
          paid_at: string | null
          proposal_id: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          id?: string
          invoice_number: string
          organization_id?: string | null
          paid_at?: string | null
          proposal_id?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          id?: string
          invoice_number?: string
          organization_id?: string | null
          paid_at?: string | null
          proposal_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_consultations: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          assigned_to: string | null
          budget_range: string
          business_name: string
          city: string | null
          consultation_snapshot: Json | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          goals: string[]
          heard_source: string | null
          id: string
          industry: string
          instagram: string | null
          lead_number: string | null
          lead_source: string | null
          message: string | null
          preferred_contact: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          timeline: string
          updated_at: string
          version: number
          website: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string | null
          budget_range: string
          business_name: string
          city?: string | null
          consultation_snapshot?: Json | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          goals?: string[]
          heard_source?: string | null
          id?: string
          industry: string
          instagram?: string | null
          lead_number?: string | null
          lead_source?: string | null
          message?: string | null
          preferred_contact?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          timeline: string
          updated_at?: string
          version?: number
          website?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string | null
          budget_range?: string
          business_name?: string
          city?: string | null
          consultation_snapshot?: Json | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          goals?: string[]
          heard_source?: string | null
          id?: string
          industry?: string
          instagram?: string | null
          lead_number?: string | null
          lead_source?: string | null
          message?: string | null
          preferred_contact?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          timeline?: string
          updated_at?: string
          version?: number
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_consultations_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_consultations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_consultations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lead_id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          payload?: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "lead_consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          archived_at: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          project_id: string
          status: string
          target_date: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          archived_at?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          project_id: string
          status?: string
          target_date: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          archived_at?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          project_id?: string
          status?: string
          target_date?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_dispatches: {
        Row: {
          channel: string
          dispatched_at: string
          event_id: string
          latency_ms: number | null
          provider: string
          provider_message_id: string
          status: string
        }
        Insert: {
          channel: string
          dispatched_at?: string
          event_id: string
          latency_ms?: number | null
          provider: string
          provider_message_id: string
          status: string
        }
        Update: {
          channel?: string
          dispatched_at?: string
          event_id?: string
          latency_ms?: number | null
          provider?: string
          provider_message_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_dispatches_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "domain_events_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      operations_health_projection: {
        Row: {
          context_name: string
          last_event_at: string | null
          last_processed_event_id: string | null
          outbox_lag: number | null
          projection_version: number | null
          queue_size: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          context_name: string
          last_event_at?: string | null
          last_processed_event_id?: string | null
          outbox_lag?: number | null
          projection_version?: number | null
          queue_size?: number | null
          status: string
          updated_at?: string | null
        }
        Update: {
          context_name?: string
          last_event_at?: string | null
          last_processed_event_id?: string | null
          outbox_lag?: number | null
          projection_version?: number | null
          queue_size?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          is_default: boolean
          joined_at: string
          organization_id: string
          user_id: string
        }
        Insert: {
          id?: string
          is_default?: boolean
          joined_at?: string
          organization_id: string
          user_id: string
        }
        Update: {
          id?: string
          is_default?: boolean
          joined_at?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_color: string
          business_category: string | null
          country: string | null
          created_at: string
          currency: string
          gst_number: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          timezone: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          brand_color?: string
          business_category?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          timezone?: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          brand_color?: string
          business_category?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          timezone?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_organization_id: string | null
          active_workspace_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_suspended: boolean
          last_login: string | null
          reactivated_at: string | null
          reactivated_by: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          active_organization_id?: string | null
          active_workspace_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          is_suspended?: boolean
          last_login?: string | null
          reactivated_at?: string | null
          reactivated_by?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          active_organization_id?: string | null
          active_workspace_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          is_suspended?: boolean
          last_login?: string | null
          reactivated_at?: string | null
          reactivated_by?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_organization_id_fkey"
            columns: ["active_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_active_workspace_id_fkey"
            columns: ["active_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_reactivated_by_fkey"
            columns: ["reactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_activity_projection: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          is_client_visible: boolean
          payload: Json
          project_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          is_client_visible?: boolean
          payload?: Json
          project_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          is_client_visible?: boolean
          payload?: Json
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_projection_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_activity_projection_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_credential_audit_logs: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          credential_id: string
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          credential_id: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          credential_id?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_credential_audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_credential_audit_logs_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "project_credentials"
            referencedColumns: ["id"]
          },
        ]
      }
      project_credential_permissions: {
        Row: {
          assigned_by: string | null
          created_at: string
          credential_id: string
          permission_type: string
          role_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          credential_id: string
          permission_type: string
          role_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          credential_id?: string
          permission_type?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_credential_permissions_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_credential_permissions_credential_id_fkey"
            columns: ["credential_id"]
            isOneToOne: false
            referencedRelation: "project_credentials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_credential_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_credentials: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          category: string
          created_at: string
          description: string | null
          environment: string | null
          expires_at: string | null
          id: string
          last_rotated_at: string
          last_viewed_at: string | null
          last_viewed_by: string | null
          name: string
          project_id: string
          provider: string
          secret_reference: string
          tags: string[] | null
          updated_at: string
          username: string | null
          version: number
          visibility: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          category: string
          created_at?: string
          description?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          last_rotated_at?: string
          last_viewed_at?: string | null
          last_viewed_by?: string | null
          name: string
          project_id: string
          provider?: string
          secret_reference: string
          tags?: string[] | null
          updated_at?: string
          username?: string | null
          version?: number
          visibility?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          category?: string
          created_at?: string
          description?: string | null
          environment?: string | null
          expires_at?: string | null
          id?: string
          last_rotated_at?: string
          last_viewed_at?: string | null
          last_viewed_by?: string | null
          name?: string
          project_id?: string
          provider?: string
          secret_reference?: string
          tags?: string[] | null
          updated_at?: string
          username?: string | null
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_credentials_archived_by_fkey"
            columns: ["archived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_credentials_last_viewed_by_fkey"
            columns: ["last_viewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_credentials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_deployments: {
        Row: {
          actor_id: string | null
          branch: string
          commit_sha: string
          completed_at: string | null
          created_at: string
          deployment_provider: string | null
          deployment_url: string | null
          environment_id: string
          id: string
          project_id: string
          started_at: string
          status: string
        }
        Insert: {
          actor_id?: string | null
          branch?: string
          commit_sha: string
          completed_at?: string | null
          created_at?: string
          deployment_provider?: string | null
          deployment_url?: string | null
          environment_id: string
          id?: string
          project_id: string
          started_at?: string
          status: string
        }
        Update: {
          actor_id?: string | null
          branch?: string
          commit_sha?: string
          completed_at?: string | null
          created_at?: string
          deployment_provider?: string | null
          deployment_url?: string | null
          environment_id?: string
          id?: string
          project_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_deployments_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deployments_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "project_environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deployments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_environments: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          project_id: string
          status: string
          type: string
          updated_at: string
          url: string
          version: number
          visibility: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          project_id: string
          status?: string
          type: string
          updated_at?: string
          url: string
          version?: number
          visibility?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          project_id?: string
          status?: string
          type?: string
          updated_at?: string
          url?: string
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_environments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_internal_notes: {
        Row: {
          author_id: string
          created_at: string
          id: string
          note_content: string
          project_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          note_content: string
          project_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          note_content?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_internal_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_internal_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          archived_at: string | null
          assignee_id: string | null
          blocked_by_task_id: string | null
          created_at: string
          description: string | null
          display_order: number
          due_date: string | null
          estimate: string | null
          github_issue: string | null
          id: string
          labels: string[] | null
          milestone_id: string | null
          priority: string
          project_id: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          archived_at?: string | null
          assignee_id?: string | null
          blocked_by_task_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_date?: string | null
          estimate?: string | null
          github_issue?: string | null
          id?: string
          labels?: string[] | null
          milestone_id?: string | null
          priority?: string
          project_id: string
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          archived_at?: string | null
          assignee_id?: string | null
          blocked_by_task_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          due_date?: string | null
          estimate?: string | null
          github_issue?: string | null
          id?: string
          labels?: string[] | null
          milestone_id?: string | null
          priority?: string
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_blocked_by_task_id_fkey"
            columns: ["blocked_by_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_template_categories: {
        Row: {
          category_name: string
          created_at: string
          display_order: number
          id: string
          template_id: string
        }
        Insert: {
          category_name: string
          created_at?: string
          display_order?: number
          id?: string
          template_id: string
        }
        Update: {
          category_name?: string
          created_at?: string
          display_order?: number
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_template_categories_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      project_template_environments: {
        Row: {
          created_at: string
          default_name: string
          display_order: number
          id: string
          template_id: string
          type: string
          visibility: string
        }
        Insert: {
          created_at?: string
          default_name: string
          display_order?: number
          id?: string
          template_id: string
          type: string
          visibility?: string
        }
        Update: {
          created_at?: string
          default_name?: string
          display_order?: number
          id?: string
          template_id?: string
          type?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_template_environments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      project_template_milestones: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          estimated_days: number
          id: string
          is_required: boolean
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          estimated_days?: number
          id?: string
          is_required?: boolean
          template_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          estimated_days?: number
          id?: string
          is_required?: boolean
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_template_milestones_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      project_templates: {
        Row: {
          created_at: string
          default_lifecycle_stages: string[]
          description: string
          id: string
          is_active: boolean
          name: string
          published_at: string
          version: number
        }
        Insert: {
          created_at?: string
          default_lifecycle_stages: string[]
          description: string
          id?: string
          is_active?: boolean
          name: string
          published_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          default_lifecycle_stages?: string[]
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          published_at?: string
          version?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          active_sprint: string | null
          archived_at: string | null
          budget_formatted: string | null
          created_at: string
          health_budget: string
          health_client_response: string
          health_scope: string
          health_timeline: string
          id: string
          lifecycle_stage: string
          name: string
          slug: string
          status: string
          target_delivery_date: string | null
          template_id: string | null
          template_version: number | null
          updated_at: string
          version: number
          workspace_id: string
        }
        Insert: {
          active_sprint?: string | null
          archived_at?: string | null
          budget_formatted?: string | null
          created_at?: string
          health_budget?: string
          health_client_response?: string
          health_scope?: string
          health_timeline?: string
          id?: string
          lifecycle_stage?: string
          name: string
          slug: string
          status?: string
          target_delivery_date?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string
          version?: number
          workspace_id: string
        }
        Update: {
          active_sprint?: string | null
          archived_at?: string | null
          budget_formatted?: string | null
          created_at?: string
          health_budget?: string
          health_client_response?: string
          health_scope?: string
          health_timeline?: string
          id?: string
          lifecycle_stage?: string
          name?: string
          slug?: string
          status?: string
          target_delivery_date?: string | null
          template_id?: string | null
          template_version?: number | null
          updated_at?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          advance_deposit_amount: number
          created_at: string
          currency: string
          deal_id: string
          expires_at: string
          id: string
          proposal_number: string
          scope_summary: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          advance_deposit_amount: number
          created_at?: string
          currency?: string
          deal_id: string
          expires_at: string
          id?: string
          proposal_number: string
          scope_summary: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          advance_deposit_amount?: number
          created_at?: string
          currency?: string
          deal_id?: string
          expires_at?: string
          id?: string
          proposal_number?: string
          scope_summary?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      studio_activity_projection: {
        Row: {
          actor_name: string | null
          created_at: string | null
          description: string | null
          event_timestamp: string | null
          event_type: string
          id: string
          last_processed_event_id: string | null
          organization_name: string | null
          project_name: string | null
          projection_version: number | null
          severity: string | null
          source_context: string | null
          tag: string | null
        }
        Insert: {
          actor_name?: string | null
          created_at?: string | null
          description?: string | null
          event_timestamp?: string | null
          event_type: string
          id?: string
          last_processed_event_id?: string | null
          organization_name?: string | null
          project_name?: string | null
          projection_version?: number | null
          severity?: string | null
          source_context?: string | null
          tag?: string | null
        }
        Update: {
          actor_name?: string | null
          created_at?: string | null
          description?: string | null
          event_timestamp?: string | null
          event_type?: string
          id?: string
          last_processed_event_id?: string | null
          organization_name?: string | null
          project_name?: string | null
          projection_version?: number | null
          severity?: string | null
          source_context?: string | null
          tag?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          category: string
          created_at: string
          description: string
          event_title: string
          id: string
          project_id: string
          visibility: string
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          event_title: string
          id?: string
          project_id: string
          visibility?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          event_title?: string
          id?: string
          project_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      top_projects_projection: {
        Row: {
          health_status: string
          last_activity_at: string | null
          last_processed_event_id: string | null
          lifecycle_stage: string
          organization_name: string
          owner_name: string | null
          progress_percentage: number | null
          project_id: string
          project_name: string
          projection_version: number | null
          updated_at: string | null
          workspace_name: string
        }
        Insert: {
          health_status: string
          last_activity_at?: string | null
          last_processed_event_id?: string | null
          lifecycle_stage: string
          organization_name: string
          owner_name?: string | null
          progress_percentage?: number | null
          project_id: string
          project_name: string
          projection_version?: number | null
          updated_at?: string | null
          workspace_name: string
        }
        Update: {
          health_status?: string
          last_activity_at?: string | null
          last_processed_event_id?: string | null
          lifecycle_stage?: string
          organization_name?: string
          owner_name?: string | null
          progress_percentage?: number | null
          project_id?: string
          project_name?: string
          projection_version?: number | null
          updated_at?: string | null
          workspace_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          organization_id: string
          primary_contact_email: string | null
          primary_contact_name: string | null
          slug: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          organization_id: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          slug: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          organization_id?: string
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          slug?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_project_credential: {
        Args: { p_actor_id: string; p_credential_id: string }
        Returns: Json
      }
      assign_role: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      check_auth_rate_limit: {
        Args: { p_email: string; p_ip: string; p_type: string }
        Returns: boolean
      }
      claim_domain_events: {
        Args: { p_batch_size: number }
        Returns: {
          aggregate_id: string
          aggregate_type: string
          attempts: number
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string
          payload: Json
          processed_at: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "domain_events_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      complete_domain_event: {
        Args: { p_error?: string; p_id: string; p_success: boolean }
        Returns: undefined
      }
      convert_lead_to_workspace: {
        Args: { p_admin_user_id: string; p_lead_id: string }
        Returns: Json
      }
      create_consultation_lead: {
        Args: { idempotency_key: string; payload: Json }
        Returns: Json
      }
      create_project_credential: {
        Args: {
          p_actor_id: string
          p_category: string
          p_description: string
          p_environment: string
          p_expires_at: string
          p_name: string
          p_project_id: string
          p_provider: string
          p_secret_reference: string
          p_tags: string[]
          p_username: string
        }
        Returns: Json
      }
      create_project_task: {
        Args: {
          p_actor_id: string
          p_assignee_id: string
          p_description: string
          p_milestone_id: string
          p_priority: string
          p_project_id: string
          p_title: string
        }
        Returns: Json
      }
      create_studio_invitation: {
        Args: { p_email: string; p_org_id: string; p_role_name: string }
        Returns: string
      }
      get_admin_workspaces: { Args: never; Returns: Json }
      log_admin_auth_event: {
        Args: { p_action: string; p_details?: Json; p_email: string }
        Returns: undefined
      }
      provision_client_command: {
        Args: {
          p_admin_user_id: string
          p_idempotency_key: string
          payload: Json
        }
        Returns: Json
      }
      provision_organization: {
        Args: {
          p_admin_id: string
          p_business_category: string
          p_gst_number: string
          p_logo_url: string
          p_name: string
          p_slug: string
          p_website_url: string
        }
        Returns: string
      }
      provision_project: {
        Args: {
          p_admin_id: string
          p_project_name: string
          p_slug: string
          p_template_id: string
          p_workspace_id: string
        }
        Returns: string
      }
      provision_workspace: {
        Args: {
          p_admin_id: string
          p_country: string
          p_is_primary: boolean
          p_name: string
          p_org_id: string
          p_primary_contact_email: string
          p_primary_contact_name: string
          p_slug: string
          p_timezone: string
        }
        Returns: string
      }
      reactivate_user_access: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      rebuild_dashboard_projections: { Args: never; Returns: undefined }
      record_auth_rate_limit: {
        Args: { p_email: string; p_ip: string; p_type: string }
        Returns: undefined
      }
      record_credential_copied: {
        Args: { p_actor_id: string; p_credential_id: string }
        Returns: Json
      }
      register_admin_session: {
        Args: {
          p_browser: string
          p_country: string
          p_email: string
          p_ip: string
          p_is_trusted: boolean
          p_os: string
          p_session_id: string
        }
        Returns: undefined
      }
      remove_role: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: undefined
      }
      resend_studio_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      reveal_project_credential: {
        Args: { p_actor_id: string; p_credential_id: string }
        Returns: Json
      }
      revoke_studio_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      rotate_project_credential: {
        Args: {
          p_actor_id: string
          p_credential_id: string
          p_new_expires_at: string
          p_new_secret_reference: string
        }
        Returns: Json
      }
      rpc_create_admin_pin: { Args: { p_pin: string }; Returns: boolean }
      rpc_create_executive_session: {
        Args: { p_metadata: Json }
        Returns: string
      }
      rpc_refresh_executive_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      rpc_revoke_all_executive_sessions: {
        Args: { p_reason: string; p_user_id: string }
        Returns: boolean
      }
      rpc_revoke_executive_session: {
        Args: { p_reason: string; p_session_id: string }
        Returns: boolean
      }
      rpc_studio_team_invitations_projection: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      rpc_studio_team_members_projection: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_role?: string
          p_search?: string
          p_status?: string
        }
        Returns: Json
      }
      rpc_validate_executive_session: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      rpc_verify_admin_pin: { Args: { p_pin: string }; Returns: boolean }
      slugify: { Args: { v: string }; Returns: string }
      suspend_user_access: {
        Args: { p_reason: string; p_user_id: string }
        Returns: undefined
      }
      update_project_task_status: {
        Args: {
          p_actor_id: string
          p_expected_version: number
          p_new_status: string
          p_task_id: string
        }
        Returns: Json
      }
      verify_admin_authorization: {
        Args: { p_email: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

