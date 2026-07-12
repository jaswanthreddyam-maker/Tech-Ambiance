// @ts-nocheck
import { EmailProvider, EmailPayload } from "../channels/EmailProvider.ts";
import { Resend } from "resend";

export class ResendProvider implements EmailProvider {
  private resend: Resend;
  private defaultFrom: string;

  constructor() {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not set. Emails will be mocked.");
    }
    this.resend = new Resend(apiKey || "mock_key");
    this.defaultFrom = Deno.env.get("RESEND_DEFAULT_FROM") || "StudioHQ <noreply@techambiance.com>";
  }

  async send(payload: EmailPayload): Promise<{ providerMessageId: string }> {
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.log("[Mock Email Sent]:", payload.subject, "to", payload.to);
      return { providerMessageId: `mock_${crypto.randomUUID()}` };
    }

    const response = await this.resend.emails.send({
      from: payload.from || this.defaultFrom,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    });

    if (response.error) {
      throw new Error(`Resend Error: ${response.error.message}`);
    }

    return { providerMessageId: response.data?.id || crypto.randomUUID() };
  }
}
