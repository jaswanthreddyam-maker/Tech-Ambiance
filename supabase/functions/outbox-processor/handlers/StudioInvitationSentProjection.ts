// @ts-nocheck
import { DomainEvent, DomainEventHandler } from "../types.ts";
import { createClient } from "@supabase/supabase-js";

export class StudioInvitationSentProjection implements DomainEventHandler {
  private supabase: any;

  constructor() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async handle(event: DomainEvent): Promise<void> {
    const invitationId = event.aggregate_id;

    // 1. Update OLTP Table (invitations) status to SENT
    const { error: updateError } = await this.supabase
      .from("invitations")
      .update({ status: "SENT" })
      .eq("id", invitationId);

    if (updateError) {
      throw new Error(`Failed to update invitation status: ${updateError.message}`);
    }
  }
}
