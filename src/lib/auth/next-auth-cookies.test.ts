import { describe, expect, it } from "vitest";
import {
  augmentAuthOptionsWithAppCookies,
  buildNextAuthCookies,
} from "@/lib/auth/next-auth-cookies";
import type { SecureAuthConfig } from "@tgoliveira/secure-auth";

const baseConfig = {
  server: { cookieSecure: true },
  app: { slug: "tgoliveira11-tech", name: "Test", baseUrl: "https://example.com" },
} as SecureAuthConfig;

describe("next-auth cookie isolation", () => {
  it("uses prefixed secure cookie names in production", () => {
    const cookies = buildNextAuthCookies("tgoliveira11-tech", true);

    expect(cookies.sessionToken.name).toBe(
      "__Secure-tgoliveira11-tech.next-auth.session-token"
    );
    expect(cookies.csrfToken.name).toBe("__Host-tgoliveira11-tech.next-auth.csrf-token");
    expect(cookies.pkceCodeVerifier.name).toBe(
      "__Secure-tgoliveira11-tech.next-auth.pkce.code_verifier"
    );
  });

  it("uses prefixed non-secure cookie names in local development", () => {
    const cookies = buildNextAuthCookies("tgoliveira11-tech", false);

    expect(cookies.sessionToken.name).toBe("tgoliveira11-tech.next-auth.session-token");
    expect(cookies.csrfToken.name).toBe("tgoliveira11-tech.next-auth.csrf-token");
  });

  it("augments auth options from AUTH_COOKIE_PREFIX", () => {
    const previousPrefix = process.env.AUTH_COOKIE_PREFIX;
    process.env.AUTH_COOKIE_PREFIX = "tgoliveira11-tech";

    try {
      const options = augmentAuthOptionsWithAppCookies(
        { secret: "test-secret", providers: [] },
        baseConfig
      );

      expect(options.useSecureCookies).toBe(true);
      expect(options.cookies?.sessionToken.name).toBe(
        "__Secure-tgoliveira11-tech.next-auth.session-token"
      );
    } finally {
      if (previousPrefix === undefined) {
        delete process.env.AUTH_COOKIE_PREFIX;
      } else {
        process.env.AUTH_COOKIE_PREFIX = previousPrefix;
      }
    }
  });
});
