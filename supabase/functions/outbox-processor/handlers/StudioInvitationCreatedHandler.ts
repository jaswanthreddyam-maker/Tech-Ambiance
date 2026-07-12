// @ts-nocheck
import { DomainEvent, DomainEventHandler } from "../types.ts";
import { NotificationService } from "../services/notification/NotificationService.ts";
import { EmailTemplateRenderer } from "../services/notification/EmailTemplateRenderer.ts";
import { StudioInvitation } from "../templates/auth/StudioInvitation.tsx";
import { createClient } from "@supabase/supabase-js";
import React from "react";

export class StudioInvitationCreatedHandler implements DomainEventHandler {
  private notificationService: NotificationService;
  private supabase: any;

  constructor() {
    this.notificationService = new NotificationService();
    
    // Initialize Supabase client for inserting the dispatch and subsequent event
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async handle(event: DomainEvent): Promise<void> {
    const { email, role, org_id, token } = event.payload;

    if (!email || !role || !org_id) {
      throw new Error("Missing required payload fields for StudioInvitationCreated");
    }

    // 1. Fetch organization name for the email
    const { data: orgData, error: orgError } = await this.supabase
      .from("organizations")
      .select("name")
      .eq("id", org_id)
      .single();

    if (orgError) {
      throw new Error(`Failed to fetch organization: ${orgError.message}`);
    }

    // 2. Render React Email Template
    // The cast to any is due to a known Deno TS issue with React.ReactElement from npm specifiers
    const element = React.createElement(StudioInvitation as any, {
      email,
      role,
      organizationName: orgData.name,
      token: token || "mock-token", // In a real app, token is passed in payload
    });

    const html = await EmailTemplateRenderer.renderHtml(element as any);

    // 3. Dispatch via Notification Service
    const { providerMessageId } = await this.notificationService.sendEmail({
      recipient: email,
      subject: `You've been invited to ${orgData.name} on StudioHQ`,
      html: html,
    });

    // 4. Record Idempotency Dispatch
    const { error: dispatchError } = await this.supabase
      .from("notification_dispatches")
      .insert({
        event_id: event.id,
        channel: "Email",
        provider: "Resend",
        provider_message_id: providerMessageId,
        status: "DELIVERED",
      });

    if (dispatchError) {
      throw new Error(`Failed to record dispatch: ${dispatchError.message}`);
    }

    // 5. Emit StudioInvitationSent event (will trigger the projection)
    const { error: newEventError } = await this.supabase
      .from("domain_events_outbox")
      .insert({
        aggregate_type: "Invitation",
        aggregate_id: event.aggregate_id,
        event_type: "StudioInvitationSent",
        payload: {
          email,
          dispatched_at: new Date().toISOString(),
          provider_message_id: providerMessageId,
        },
      });

    if (newEventError) {
      throw new Error(`Failed to emit StudioInvitationSent event: ${newEventError.message}`);
    }
  }
}
