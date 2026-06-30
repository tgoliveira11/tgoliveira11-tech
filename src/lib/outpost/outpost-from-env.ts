import "server-only";

import {
  ConsoleLogger,
  FakeEmailProvider,
  ResendEmailProvider,
} from "@tgoliveira/outpost/adapters";
import { readEmailFrom, readEnv, readResendApiKey } from "@/lib/env";
import { resolveEmailProviderName } from "@/lib/email/email-provider-factory";

export function readOutpostRecipientHmacKey(): string {
  const key = readEnv("OUTPOST_RECIPIENT_HMAC_KEY") ?? readEnv("OUTPOST_HMAC_KEY");
  if (key && key.length >= 16) {
    return key;
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-outpost-hmac-key-min-16b";
  }

  throw new Error(
    "OUTPOST_RECIPIENT_HMAC_KEY (or OUTPOST_HMAC_KEY) must be set and at least 16 characters in production."
  );
}

export function buildOutpostClientOptions() {
  const emailProviderName = resolveEmailProviderName();
  const from = readEmailFrom() ?? "PostForge <noreply@localhost>";

  const providers =
    emailProviderName === "resend"
      ? [
          new ResendEmailProvider({
            apiKey: readResendApiKey() ?? "",
            from,
            webhookSecret: readEnv("RESEND_WEBHOOK_SECRET"),
          }),
        ]
      : [new FakeEmailProvider()];

  if (emailProviderName === "resend" && !readResendApiKey()) {
    throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
  }

  return {
    providers,
    recipientHmacKey: readOutpostRecipientHmacKey(),
    logger: new ConsoleLogger(process.env.NODE_ENV === "production" ? "warn" : "debug"),
    encryption: { mode: "none" as const },
  };
}
