export { EMAIL_BRAND } from "./email-brand";
export { buildAuthActionUrl, extractFirstUrl } from "./email-url";
export { escapeHtml } from "./email-html";
export { renderEmailVerificationTemplate } from "./verification-email.template";
export { renderPasswordResetTemplate } from "./password-reset-email.template";
export { renderSecurityEventTemplate } from "./security-event-email.template";
export {
  createSecureAuthEmailTemplates,
  resolveBrandedAppName,
} from "./secure-auth-email-templates";
