import type { EmailProvider } from "@tgoliveira/secure-auth/email";

/** Dev EmailProvider — logs delivery to the console, no SMTP. */
export const devEmailProvider: EmailProvider = {
  async send(input) {
    console.info("[postforge email]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  },
};
