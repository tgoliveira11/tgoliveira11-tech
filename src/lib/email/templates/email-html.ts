import { EMAIL_BRAND } from "./email-brand";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderPlainLinkFallback(label: string, url: string): string {
  return `${label}\n${url}`;
}

export function renderHtmlLinkFallback(label: string, url: string): string {
  const safeLabel = escapeHtml(label);
  const safeUrl = escapeHtml(url);
  return `<p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${EMAIL_BRAND.colors.muted};">${safeLabel}<br><a href="${safeUrl}" style="color:${EMAIL_BRAND.colors.accent};word-break:break-all;">${safeUrl}</a></p>`;
}

export function renderCtaButton(label: string, url: string): string {
  const safeLabel = escapeHtml(label);
  const safeUrl = escapeHtml(url);
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0;">
  <tr>
    <td style="border-radius:8px;background:${EMAIL_BRAND.colors.buttonBackground};">
      <a href="${safeUrl}" style="display:inline-block;padding:12px 20px;font-size:15px;font-weight:600;line-height:1.2;color:${EMAIL_BRAND.colors.buttonText};text-decoration:none;border-radius:8px;">${safeLabel}</a>
    </td>
  </tr>
</table>`;
}

export type EmailLayoutInput = {
  title: string;
  intro: string;
  bodyHtml: string;
  securityNote?: string;
  appBaseUrl: string;
};

export function renderEmailLayout({
  title,
  intro,
  bodyHtml,
  securityNote = EMAIL_BRAND.securityNote,
  appBaseUrl,
}: EmailLayoutInput): string {
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeSecurity = escapeHtml(securityNote);
  const safeSiteName = escapeHtml(EMAIL_BRAND.siteName);
  const safeTagline = escapeHtml(EMAIL_BRAND.tagline);
  const safeHomeUrl = escapeHtml(appBaseUrl.replace(/\/$/, ""));
  const safeGithub = escapeHtml(EMAIL_BRAND.githubUrl);
  const safeLinkedIn = escapeHtml(EMAIL_BRAND.linkedInUrl);
  const safeFooter = escapeHtml(EMAIL_BRAND.transactionalFooter);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:${EMAIL_BRAND.colors.pageBackground};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EMAIL_BRAND.colors.body};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${EMAIL_BRAND.colors.pageBackground};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
            <tr>
              <td style="padding:0 0 20px;text-align:center;">
                <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:-0.02em;color:${EMAIL_BRAND.colors.heading};">${safeSiteName}</p>
                <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:${EMAIL_BRAND.colors.muted};">${safeTagline}</p>
              </td>
            </tr>
            <tr>
              <td style="background:${EMAIL_BRAND.colors.cardBackground};border:1px solid ${EMAIL_BRAND.colors.border};border-radius:14px;padding:28px 24px;">
                <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:700;color:${EMAIL_BRAND.colors.heading};">${safeTitle}</h1>
                <p style="margin:0;font-size:16px;line-height:1.6;color:${EMAIL_BRAND.colors.body};">${safeIntro}</p>
                ${bodyHtml}
                <p style="margin:24px 0 0;padding:16px 0 0;border-top:1px solid ${EMAIL_BRAND.colors.border};font-size:14px;line-height:1.6;color:${EMAIL_BRAND.colors.muted};">${safeSecurity}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 8px 0;text-align:center;font-size:12px;line-height:1.7;color:${EMAIL_BRAND.colors.footer};">
                <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_BRAND.colors.heading};">${safeSiteName}</p>
                <p style="margin:0 0 8px;">
                  <a href="${safeHomeUrl}" style="color:${EMAIL_BRAND.colors.accent};text-decoration:none;">Visit the blog</a>
                  &nbsp;·&nbsp;
                  <a href="${safeGithub}" style="color:${EMAIL_BRAND.colors.accent};text-decoration:none;">GitHub</a>
                  &nbsp;·&nbsp;
                  <a href="${safeLinkedIn}" style="color:${EMAIL_BRAND.colors.accent};text-decoration:none;">LinkedIn</a>
                </p>
                <p style="margin:0;">${safeFooter}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEmailTextFooter(appBaseUrl: string): string {
  const homeUrl = appBaseUrl.replace(/\/$/, "");
  return [
    "",
    EMAIL_BRAND.siteName,
    `Blog: ${homeUrl}`,
    `GitHub: ${EMAIL_BRAND.githubUrl}`,
    `LinkedIn: ${EMAIL_BRAND.linkedInUrl}`,
    "",
    EMAIL_BRAND.transactionalFooter,
  ].join("\n");
}
