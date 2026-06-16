import { describe, expect, it } from "vitest";
import { escapeHtml } from "./email-html";
import { renderPasswordResetTemplate } from "./password-reset-email.template";
import { renderSecurityEventTemplate } from "./security-event-email.template";
import { createSecureAuthEmailTemplates } from "./secure-auth-email-templates";
import { renderEmailVerificationTemplate } from "./verification-email.template";

const APP_BASE_URL = "https://tgoliveira11-tech.vercel.app";
const VERIFY_URL = `${APP_BASE_URL}/verify-email?token=test-token`;
const RESET_URL = `${APP_BASE_URL}/reset-password?token=reset-token`;

describe("email templates", () => {
  it("escapes unsafe HTML in rendered output", () => {
    const escaped = escapeHtml(`<script>alert("x")</script>`);
    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
  });

  it("renders verification email with CTA URL in html and text", () => {
    const email = renderEmailVerificationTemplate({
      appName: "tgoliveira11 tech",
      verifyUrl: VERIFY_URL,
      appBaseUrl: APP_BASE_URL,
      userEmail: "reader@example.com",
    });

    expect(email.subject).toBe("Verify your email — tgoliveira11 tech");
    expect(email.html).toContain(VERIFY_URL);
    expect(email.text).toContain(VERIFY_URL);
    expect(email.html).toContain("Verify email address");
    expect(email.text).toContain("reader@example.com");
    expect(email.html).not.toContain("undefined");
    expect(email.text).not.toContain("undefined");
  });

  it("renders password reset email with CTA URL in html and text", () => {
    const email = renderPasswordResetTemplate({
      appName: "tgoliveira11 tech",
      resetUrl: RESET_URL,
      appBaseUrl: APP_BASE_URL,
      userEmail: "reader@example.com",
    });

    expect(email.subject).toBe("Reset your password — tgoliveira11 tech");
    expect(email.html).toContain(RESET_URL);
    expect(email.text).toContain(RESET_URL);
    expect(email.html).toContain("Reset password");
    expect(email.text).toContain("passkeys or OAuth");
  });

  it("renders security event template without nullish values", () => {
    const email = renderSecurityEventTemplate({
      appName: "tgoliveira11 tech",
      appBaseUrl: APP_BASE_URL,
      eventName: "Two-factor authentication enabled",
      userEmail: "reader@example.com",
      occurredAt: "2026-06-16T12:00:00.000Z",
    });

    expect(email.subject).toContain("Two-factor authentication enabled");
    expect(email.html).toContain("reader@example.com");
    expect(email.text).toContain("reader@example.com");
    expect(email.html).not.toContain("undefined");
  });

  it("exposes secure-auth template adapters with required fields", () => {
    const templates = createSecureAuthEmailTemplates();

    const verification = templates.verificationEmail?.({
      appName: "tgoliveira11 tech",
      verifyUrl: VERIFY_URL,
    });
    const reset = templates.passwordReset?.({
      appName: "tgoliveira11 tech",
      resetUrl: RESET_URL,
    });

    expect(verification?.subject).toContain("Verify your email");
    expect(verification?.html).toContain(VERIFY_URL);
    expect(verification?.text).toContain(VERIFY_URL);

    expect(reset?.subject).toContain("Reset your password");
    expect(reset?.html).toContain(RESET_URL);
    expect(reset?.text).toContain(RESET_URL);
  });
});
