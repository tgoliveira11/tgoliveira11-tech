import { describe, expect, it, afterEach } from "vitest";
import { buildOutpostClientOptions, readOutpostRecipientHmacKey } from "./outpost-from-env";

describe("readOutpostRecipientHmacKey", () => {
  const original = process.env.OUTPOST_RECIPIENT_HMAC_KEY;

  afterEach(() => {
    process.env.OUTPOST_RECIPIENT_HMAC_KEY = original;
    process.env.NODE_ENV = "test";
  });

  it("uses dev fallback outside production when unset", () => {
    delete process.env.OUTPOST_RECIPIENT_HMAC_KEY;
    process.env.NODE_ENV = "development";
    expect(readOutpostRecipientHmacKey()).toBe("dev-outpost-hmac-key-min-16b");
  });

  it("reads explicit production key", () => {
    process.env.OUTPOST_RECIPIENT_HMAC_KEY = "production-hmac-key-32chars-min";
    expect(readOutpostRecipientHmacKey()).toBe("production-hmac-key-32chars-min");
  });
});

describe("buildOutpostClientOptions", () => {
  it("uses FakeEmailProvider for console email mode", () => {
    const options = buildOutpostClientOptions();
    expect(options.providers).toHaveLength(1);
    expect(options.providers[0]?.name).toBe("fake");
    expect(options.encryption).toEqual({ mode: "none" });
  });

  it("throws in production when hmac key is missing", () => {
    delete process.env.OUTPOST_RECIPIENT_HMAC_KEY;
    process.env.NODE_ENV = "production";
    expect(() => readOutpostRecipientHmacKey()).toThrow(/OUTPOST_RECIPIENT_HMAC_KEY/);
  });

  it("reads OUTPOST_HMAC_KEY alias", () => {
    delete process.env.OUTPOST_RECIPIENT_HMAC_KEY;
    process.env.OUTPOST_HMAC_KEY = "alias-hmac-key-16b";
    expect(readOutpostRecipientHmacKey()).toBe("alias-hmac-key-16b");
  });

  it("uses ResendEmailProvider when EMAIL_PROVIDER=resend", () => {
    const originalProvider = process.env.EMAIL_PROVIDER;
    const originalKey = process.env.RESEND_API_KEY;
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "re_test_key";

    const options = buildOutpostClientOptions();
    expect(options.providers[0]?.name).toBe("resend");

    process.env.EMAIL_PROVIDER = originalProvider;
    process.env.RESEND_API_KEY = originalKey;
  });

  it("throws when resend is selected without API key", () => {
    const originalProvider = process.env.EMAIL_PROVIDER;
    const originalKey = process.env.RESEND_API_KEY;
    process.env.EMAIL_PROVIDER = "resend";
    delete process.env.RESEND_API_KEY;

    expect(() => buildOutpostClientOptions()).toThrow(/RESEND_API_KEY/);

    process.env.EMAIL_PROVIDER = originalProvider;
    process.env.RESEND_API_KEY = originalKey;
  });
});
