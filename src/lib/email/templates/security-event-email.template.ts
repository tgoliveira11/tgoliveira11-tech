import { EMAIL_BRAND } from "./email-brand";
import {
  renderEmailLayout,
  renderEmailTextFooter,
} from "./email-html";

/** Prepared for future secure-auth security notifications (not wired in package v0.1.10). */
export type SecurityEventTemplateInput = {
  appName: string;
  appBaseUrl: string;
  eventName: string;
  userEmail: string;
  occurredAt?: string;
  details?: string;
};

export function renderSecurityEventTemplate({
  appName,
  appBaseUrl,
  eventName,
  userEmail,
  occurredAt,
  details,
}: SecurityEventTemplateInput) {
  const subject = `Security update — ${eventName} — ${appName}`;
  const intro = `A security-related change was made on your ${appName} account (${userEmail}).`;

  const detailLines = [
    occurredAt ? `When: ${occurredAt}` : null,
    details ? details : null,
  ].filter(Boolean);

  const bodyHtml = detailLines.length
    ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:${EMAIL_BRAND.colors.body};">${detailLines.join("<br>")}</p>`
    : "";

  const html = renderEmailLayout({
    title: eventName,
    intro,
    bodyHtml,
    appBaseUrl,
  });

  const text = [
    eventName,
    "",
    intro,
    ...detailLines.map((line) => (line ? `\n${line}` : "")),
    "",
    EMAIL_BRAND.securityNote,
    renderEmailTextFooter(appBaseUrl),
  ].join("\n");

  return { subject, html, text };
}
