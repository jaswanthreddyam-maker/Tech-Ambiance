import { EmailProvider, EmailPayload } from "../channels/EmailProvider.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

export class SmtpProvider implements EmailProvider {
  private defaultFrom: string;

  constructor() {
    this.defaultFrom = Deno.env.get("SMTP_DEFAULT_FROM") || "StudioHQ <hello.techambiance@gmail.com>";
  }

  async send(payload: EmailPayload): Promise<{ providerMessageId: string }> {
    const password = Deno.env.get("SMTP_PASSWORD");
    if (!password) {
      console.log("[Mock Email Sent]:", payload.subject, "to", payload.to);
      return { providerMessageId: `mock_${crypto.randomUUID()}` };
    }

    const client = new SmtpClient();

    try {
      await client.connectTLS({
        hostname: "smtp.gmail.com",
        port: 465,
        username: "hello.techambiance@gmail.com",
        password: password,
      });

      await client.send({
        from: payload.from || this.defaultFrom,
        to: payload.to,
        subject: payload.subject,
        content: payload.html,
        html: payload.html,
      });
      
      await client.close();

      return { providerMessageId: crypto.randomUUID() };
    } catch (error: any) {
      throw new Error(`SMTP Error: ${error.message}`);
    }
  }
}
