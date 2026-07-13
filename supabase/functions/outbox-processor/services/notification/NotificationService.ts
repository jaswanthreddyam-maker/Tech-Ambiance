import { EmailPayload } from "./channels/EmailProvider.ts";
import { SmtpProvider } from "./providers/SmtpProvider.ts";

export interface NotificationPayload {
  recipient: string;
  subject: string;
  html: string;
}

export class NotificationService {
  private emailProvider: SmtpProvider;

  constructor() {
    this.emailProvider = new SmtpProvider();
  }

  async sendEmail(payload: NotificationPayload): Promise<{ providerMessageId: string }> {
    return await this.emailProvider.send({
      to: payload.recipient,
      subject: payload.subject,
      html: payload.html,
    });
  }
}
