import type { SecureAuthServices } from "@tgoliveira/secure-auth";
import {
  buildAuthActionUrl,
  createSecureAuthEmailTemplates,
  resolveBrandedAppName,
} from "@/lib/email/templates";

const PATCHED = Symbol("appEmailTemplatesPatched");

/**
 * secure-auth v0.1.10 exposes `email.templates` in types but still renders
 * built-in HTML in `ctx.verificationEmailContent` / `ctx.passwordResetEmailContent`.
 * Patch those ctx helpers locally until the package reads config.email.templates.
 */
export function patchSecureAuthEmailTemplates(services: SecureAuthServices): SecureAuthServices {
  if (!services.ctx) {
    return services;
  }

  const ctx = services.ctx as typeof services.ctx & { [PATCHED]?: boolean };
  if (ctx[PATCHED]) {
    return services;
  }

  const templates = createSecureAuthEmailTemplates();
  const config = services.config;
  const appName = resolveBrandedAppName(config.app.name);

  const normalize = (content: { subject: string; html: string; text?: string }) => ({
    subject: content.subject,
    html: content.html,
    text: content.text ?? "",
  });

  ctx.verificationEmailContent = (token: string) => {
    const verifyUrl = buildAuthActionUrl(config.app.baseUrl, "/verify-email", token);
    return normalize(
      templates.verificationEmail?.({ appName, verifyUrl }) ?? {
        subject: `Verify your email — ${appName}`,
        html: "",
        text: verifyUrl,
      }
    );
  };

  ctx.passwordResetEmailContent = (token: string) => {
    const resetUrl = buildAuthActionUrl(config.app.baseUrl, "/reset-password", token);
    return normalize(
      templates.passwordReset?.({ appName, resetUrl }) ?? {
        subject: `Reset your password — ${appName}`,
        html: "",
        text: resetUrl,
      }
    );
  };

  ctx[PATCHED] = true;
  return services;
}
