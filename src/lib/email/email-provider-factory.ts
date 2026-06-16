import "server-only";

import type { EmailProvider } from "@tgoliveira/secure-auth/email";
import { devEmailProvider } from "@/lib/email/dev-email-provider";
import { createResendEmailProvider } from "@/lib/email/resend-email-provider";
import {
  readEmailFrom,
  readEmailProvider,
  readEmailReplyTo,
  readResendApiKey,
  type EmailProviderName,
} from "@/lib/env";

export function resolveEmailProviderName(raw = readEmailProvider()): EmailProviderName {
  const value = (raw ?? "console").toLowerCase();
  if (value === "console" || value === "resend") {
    return value;
  }

  throw new Error(
    `Unsupported EMAIL_PROVIDER "${raw}". Expected "console" or "resend".`
  );
}

export function createEmailProvider(providerName?: EmailProviderName): EmailProvider {
  const name = providerName ?? resolveEmailProviderName();

  if (name === "console") {
    return devEmailProvider;
  }

  const apiKey = readResendApiKey();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
  }

  const from = readEmailFrom();
  if (!from) {
    throw new Error("EMAIL_FROM is required when EMAIL_PROVIDER=resend");
  }

  return createResendEmailProvider({
    apiKey,
    from,
    replyTo: readEmailReplyTo(),
  });
}
