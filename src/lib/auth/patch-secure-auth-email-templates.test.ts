import { describe, expect, it, vi } from "vitest";
import { patchSecureAuthEmailTemplates } from "@/lib/auth/patch-secure-auth-email-templates";

describe("patchSecureAuthEmailTemplates", () => {
  it("replaces verification and password reset content with branded templates", () => {
    const services = {
      config: {
        app: {
          name: "tgoliveira11-tech",
          slug: "tgoliveira11-tech",
          baseUrl: "https://tgoliveira11-tech.vercel.app",
        },
      },
      ctx: {
        verificationEmailContent: vi.fn(() => ({
          subject: "default verify",
          html: "<p>default</p>",
          text: "default",
        })),
        passwordResetEmailContent: vi.fn(() => ({
          subject: "default reset",
          html: "<p>default</p>",
          text: "default",
        })),
      },
    } as never;

    patchSecureAuthEmailTemplates(services);

    const verification = services.ctx.verificationEmailContent("verify-token");
    const reset = services.ctx.passwordResetEmailContent("reset-token");

    expect(verification.subject).toContain("Verify your email — Thiago Oliveira Tech");
    expect(verification.html).toContain(
      "https://tgoliveira11-tech.vercel.app/verify-email?token=verify-token"
    );
    expect(verification.text).toContain(
      "https://tgoliveira11-tech.vercel.app/verify-email?token=verify-token"
    );

    expect(reset.subject).toContain("Reset your password — Thiago Oliveira Tech");
    expect(reset.html).toContain(
      "https://tgoliveira11-tech.vercel.app/reset-password?token=reset-token"
    );
    expect(reset.text).toContain(
      "https://tgoliveira11-tech.vercel.app/reset-password?token=reset-token"
    );
  });
});
