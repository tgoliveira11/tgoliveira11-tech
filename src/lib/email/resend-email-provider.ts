import "server-only";

import type { EmailProvider } from "@tgoliveira/secure-auth/email";
import { Resend } from "resend";

export type ResendEmailProviderConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
};

export function createResendEmailProvider(config: ResendEmailProviderConfig): EmailProvider {
  const resend = new Resend(config.apiKey);

  return {
    async send(input) {
      const { error } = await resend.emails.send({
        from: config.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        replyTo: config.replyTo,
      });

      if (error) {
        throw new Error(`Failed to send email via Resend: ${error.message}`);
      }
    },
  };
}
