import { EMAIL_BRAND } from "./email-brand";
import {
  renderCtaButton,
  renderEmailLayout,
  renderEmailTextFooter,
  renderHtmlLinkFallback,
  renderPlainLinkFallback,
} from "./email-html";

export type EmailVerificationTemplateInput = {
  appName: string;
  verifyUrl: string;
  appBaseUrl: string;
  userEmail?: string;
  expiresIn?: string;
};

export function renderEmailVerificationTemplate({
  appName,
  verifyUrl,
  appBaseUrl,
  userEmail,
  expiresIn = "This verification link expires after a limited time for security.",
}: EmailVerificationTemplateInput) {
  const subject = `Verify your email — ${appName}`;
  const intro = userEmail
    ? `Please confirm ${userEmail} to finish setting up your ${appName} account.`
    : `Please confirm your email address to finish setting up your ${appName} account.`;

  const bodyHtml = [
    renderCtaButton("Verify email address", verifyUrl),
    renderHtmlLinkFallback("Or copy and paste this link into your browser:", verifyUrl),
    `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.colors.muted};">${expiresIn}</p>`,
  ].join("");

  const html = renderEmailLayout({
    title: "Verify your email",
    intro,
    bodyHtml,
    appBaseUrl,
  });

  const text = [
    "Verify your email",
    "",
    intro,
    "",
    renderPlainLinkFallback("Verify your email address:", verifyUrl),
    "",
    expiresIn,
    "",
    EMAIL_BRAND.securityNote,
    renderEmailTextFooter(appBaseUrl),
  ].join("\n");

  return { subject, html, text };
}
