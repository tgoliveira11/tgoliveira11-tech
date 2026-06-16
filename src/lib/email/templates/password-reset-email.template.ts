import { EMAIL_BRAND } from "./email-brand";
import {
  renderCtaButton,
  renderEmailLayout,
  renderEmailTextFooter,
  renderHtmlLinkFallback,
  renderPlainLinkFallback,
} from "./email-html";

const PASSWORD_RESET_NOTE =
  "This changes your account password only. Other sign-in methods such as passkeys or OAuth remain available.";

export type PasswordResetTemplateInput = {
  appName: string;
  resetUrl: string;
  appBaseUrl: string;
  userEmail?: string;
  expiresIn?: string;
};

export function renderPasswordResetTemplate({
  appName,
  resetUrl,
  appBaseUrl,
  userEmail,
  expiresIn = "This reset link expires after a limited time for security.",
}: PasswordResetTemplateInput) {
  const subject = `Reset your password — ${appName}`;
  const intro = userEmail
    ? `We received a request to reset the password for ${userEmail} on ${appName}.`
    : `We received a request to reset your ${appName} account password.`;

  const bodyHtml = [
    renderCtaButton("Reset password", resetUrl),
    renderHtmlLinkFallback("Or copy and paste this link into your browser:", resetUrl),
    `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:${EMAIL_BRAND.colors.body};">${PASSWORD_RESET_NOTE}</p>`,
    `<p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.colors.muted};">${expiresIn}</p>`,
  ].join("");

  const html = renderEmailLayout({
    title: "Reset your password",
    intro,
    bodyHtml,
    appBaseUrl,
  });

  const text = [
    "Reset your password",
    "",
    intro,
    "",
    renderPlainLinkFallback("Reset your password:", resetUrl),
    "",
    PASSWORD_RESET_NOTE,
    "",
    expiresIn,
    "",
    EMAIL_BRAND.securityNote,
    renderEmailTextFooter(appBaseUrl),
  ].join("\n");

  return { subject, html, text };
}
