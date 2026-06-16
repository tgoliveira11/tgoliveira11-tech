import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { devEmailProvider } from "@/lib/email/dev-email-provider";

const { sendMock } = vi.hoisted(() => {
  const sendMock = vi.fn();
  return { sendMock };
});

vi.mock("resend", () => ({
  Resend: class ResendMock {
    emails = { send: sendMock };
    constructor() {}
  },
}));

import {
  createEmailProvider,
  resolveEmailProviderName,
} from "@/lib/email/email-provider-factory";
import { createResendEmailProvider } from "@/lib/email/resend-email-provider";

describe("email provider factory", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("defaults to console provider when EMAIL_PROVIDER is unset", () => {
    delete process.env.EMAIL_PROVIDER;
    expect(resolveEmailProviderName()).toBe("console");
    expect(createEmailProvider()).toBe(devEmailProvider);
  });

  it("returns console provider when EMAIL_PROVIDER=console", () => {
    process.env.EMAIL_PROVIDER = "console";
    expect(createEmailProvider("console")).toBe(devEmailProvider);
  });

  it("does not require RESEND_API_KEY when provider is console", () => {
    process.env.EMAIL_PROVIDER = "console";
    delete process.env.RESEND_API_KEY;
    expect(() => createEmailProvider("console")).not.toThrow();
  });

  it("returns Resend provider when EMAIL_PROVIDER=resend", () => {
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "Blog <noreply@mail.example.com>";

    const provider = createEmailProvider("resend");
    expect(provider).not.toBe(devEmailProvider);
  });

  it("throws when EMAIL_PROVIDER=resend and RESEND_API_KEY is missing", () => {
    process.env.EMAIL_PROVIDER = "resend";
    delete process.env.RESEND_API_KEY;
    process.env.EMAIL_FROM = "Blog <noreply@mail.example.com>";

    expect(() => createEmailProvider("resend")).toThrow(
      "RESEND_API_KEY is required when EMAIL_PROVIDER=resend"
    );
  });

  it("throws when EMAIL_PROVIDER=resend and EMAIL_FROM is missing", () => {
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "re_test_key";
    delete process.env.EMAIL_FROM;

    expect(() => createEmailProvider("resend")).toThrow(
      "EMAIL_FROM is required when EMAIL_PROVIDER=resend"
    );
  });

  it("rejects unknown EMAIL_PROVIDER values", () => {
    expect(() => resolveEmailProviderName("smtp")).toThrow(/Unsupported EMAIL_PROVIDER/);
  });
});

describe("resend email provider", () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("calls Resend send API with from, to, subject, html, text, and replyTo", async () => {
    const provider = createResendEmailProvider({
      apiKey: "re_test_key",
      from: "Blog <noreply@mail.example.com>",
      replyTo: "owner@example.com",
    });

    await provider.send({
      to: "reader@example.com",
      subject: "Verify your email",
      html: "<p>Verify</p>",
      text: "Verify",
    });

    expect(sendMock).toHaveBeenCalledWith({
      from: "Blog <noreply@mail.example.com>",
      to: "reader@example.com",
      subject: "Verify your email",
      html: "<p>Verify</p>",
      text: "Verify",
      replyTo: "owner@example.com",
    });
  });

  it("throws predictable errors when Resend send fails", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: "Domain not verified" },
    });

    const provider = createResendEmailProvider({
      apiKey: "re_secret_value",
      from: "Blog <noreply@mail.example.com>",
    });

    await expect(
      provider.send({
        to: "reader@example.com",
        subject: "Reset password",
        html: "<p>Reset</p>",
      })
    ).rejects.toThrow("Failed to send email via Resend: Domain not verified");
  });

  it("omits replyTo when not configured", async () => {
    const provider = createResendEmailProvider({
      apiKey: "re_test_key",
      from: "Blog <noreply@mail.example.com>",
    });

    await provider.send({
      to: "reader@example.com",
      subject: "Hello",
      html: "<p>Hello</p>",
    });

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: undefined,
      })
    );
  });
});
