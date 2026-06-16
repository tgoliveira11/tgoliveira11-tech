import type { SecureAuthEmailTemplates } from "@tgoliveira/secure-auth/email";
import { EMAIL_BRAND } from "./email-brand";
import { renderPasswordResetTemplate } from "./password-reset-email.template";
import { renderEmailVerificationTemplate } from "./verification-email.template";

export function createSecureAuthEmailTemplates(): SecureAuthEmailTemplates {
  return {
    verificationEmail({ appName, verifyUrl }) {
      return renderEmailVerificationTemplate({
        appName,
        verifyUrl,
        appBaseUrl: resolveBaseUrlFromActionUrl(verifyUrl),
      });
    },
    passwordReset({ appName, resetUrl }) {
      return renderPasswordResetTemplate({
        appName,
        resetUrl,
        appBaseUrl: resolveBaseUrlFromActionUrl(resetUrl),
      });
    },
  };
}

export function resolveBrandedAppName(appName: string): string {
  return appName === "tgoliveira11-tech" ? EMAIL_BRAND.siteName : appName;
}

function resolveBaseUrlFromActionUrl(actionUrl: string): string {
  try {
    const url = new URL(actionUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return actionUrl;
  }
}
