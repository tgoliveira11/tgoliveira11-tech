import type { EmailProvider } from "@tgoliveira/secure-auth/email";
import { extractFirstUrl } from "@/lib/email/templates";

/** Dev EmailProvider — logs delivery to the console, no SMTP. */
export const devEmailProvider: EmailProvider = {
  async send(input) {
    const actionLink = extractFirstUrl(input.text) ?? extractFirstUrl(input.html);

    console.info("[tgoliveira11-tech email]", {
      to: input.to,
      subject: input.subject,
      actionLink,
      textPreview: input.text?.split("\n").slice(0, 8).join("\n"),
    });
  },
};
