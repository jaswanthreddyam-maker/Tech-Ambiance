import { EmailPayload } from "./channels/EmailProvider.ts";
import { ResendProvider } from "./providers/ResendProvider.ts";

export interface NotificationPayload {
  recipient: string;
  subject: string;
  html: string;
}

export class NotificationService {
  private emailProvider: ResendProvider;

  constructor() {
    this.emailProvider = new ResendProvider();
  }

  async sendEmail(payload: NotificationPayload): Promise<{ providerMessageId: string }> {
    return await this.emailProvider.send({
      to: payload.recipient,
      subject: payload.subject,
      html: payload.html,
    });
  }
}
