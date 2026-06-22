import { describe, expect, it } from "vitest";
import { buildSecureAuthConfigFromEnv } from "./secure-auth-from-env";

const defaults = {
  appName: "tgoliveira11-tech",
  appSlug: "tgoliveira11-tech",
  baseUrl: "http://localhost:3011",
  afterLoginPath: "/admin",
};

const secrets = {
  NEXTAUTH_SECRET: "test-secret",
  TWO_FACTOR_SECRET_ENCRYPTION_KEY: "2fa-key",
};

describe("buildSecureAuthConfigFromEnv auth redirects", () => {
  it("enables guest-page redirects by default and targets afterLoginPath", () => {
    const config = buildSecureAuthConfigFromEnv(defaults, secrets);

    expect(config.auth.redirectAuthenticatedFromGuestPages).toBe(true);
    expect(config.auth.authenticatedRedirectPath).toBe("/admin");
    expect(config.auth.afterLoginPath).toBe("/admin");
  });

  it("maps AUTH_AUTHENTICATED_REDIRECT_PATH and AUTH_REDIRECT_AUTHENTICATED_FROM_GUEST_PAGES", () => {
    const config = buildSecureAuthConfigFromEnv(defaults, {
      ...secrets,
      AUTH_AUTHENTICATED_REDIRECT_PATH: "/custom-home",
      AUTH_REDIRECT_AUTHENTICATED_FROM_GUEST_PAGES: "false",
    });

    expect(config.auth.authenticatedRedirectPath).toBe("/custom-home");
    expect(config.auth.redirectAuthenticatedFromGuestPages).toBe(false);
  });
});

describe("buildSecureAuthConfigFromEnv API security (0.1.21+)", () => {
  it("requires email verification for account APIs by default", () => {
    const config = buildSecureAuthConfigFromEnv(defaults, secrets);
    expect(config.accountPolicy?.requireEmailVerificationForAccountApis).toBe(true);
  });

  it("enables same-origin protection by default", () => {
    const config = buildSecureAuthConfigFromEnv(defaults, secrets);
    expect(config.security?.sameOriginProtection?.enabled).toBe(true);
    expect(config.security?.sameOriginProtection?.allowedOrigins).toEqual([]);
  });

  it("maps optional API security env overrides", () => {
    const config = buildSecureAuthConfigFromEnv(defaults, {
      ...secrets,
      EMAIL_VERIFICATION_REQUIRE_FOR_ACCOUNT_APIS: "false",
      AUTH_SAME_ORIGIN_PROTECTION_ENABLED: "false",
      AUTH_ALLOWED_ORIGINS: "https://preview.example.com, https://staging.example.com",
      AUTH_DEBUG_EXPOSE_TRACE_ROUTE: "true",
    });

    expect(config.accountPolicy?.requireEmailVerificationForAccountApis).toBe(false);
    expect(config.security?.sameOriginProtection?.enabled).toBe(false);
    expect(config.security?.sameOriginProtection?.allowedOrigins).toEqual([
      "https://preview.example.com",
      "https://staging.example.com",
    ]);
    expect(config.debug?.exposeTraceRoute).toBe(true);
  });
});
