import { describe, expect, it } from "vitest";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";

describe("buildSecureAuthConfigFromEnv auth redirects", () => {
  it("enables guest-page redirects by default and targets afterLoginPath", () => {
    const config = buildSecureAuthConfigFromEnv(
      {
        appName: "PostForge",
        appSlug: "postforge",
        baseUrl: "http://localhost:3000",
        afterLoginPath: "/admin",
      },
      {
        NEXTAUTH_SECRET: "secret",
        TWO_FACTOR_SECRET_ENCRYPTION_KEY: "2fa-key",
      }
    );

    expect(config.auth.redirectAuthenticatedFromGuestPages).toBe(true);
    expect(config.auth.authenticatedRedirectPath).toBe("/admin");
    expect(config.auth.afterLoginPath).toBe("/admin");
  });

  it("maps AUTH_AUTHENTICATED_REDIRECT_PATH and AUTH_REDIRECT_AUTHENTICATED_FROM_GUEST_PAGES", () => {
    const config = buildSecureAuthConfigFromEnv(
      {
        appName: "PostForge",
        appSlug: "postforge",
        baseUrl: "http://localhost:3000",
        afterLoginPath: "/admin",
      },
      {
        NEXTAUTH_SECRET: "secret",
        TWO_FACTOR_SECRET_ENCRYPTION_KEY: "2fa-key",
        AUTH_AUTHENTICATED_REDIRECT_PATH: "/settings/account",
        AUTH_REDIRECT_AUTHENTICATED_FROM_GUEST_PAGES: "false",
      }
    );

    expect(config.auth.authenticatedRedirectPath).toBe("/settings/account");
    expect(config.auth.redirectAuthenticatedFromGuestPages).toBe(false);
  });
});

describe("buildSecureAuthConfigFromEnv API security (0.1.21+)", () => {
  const defaults = {
    appName: "PostForge",
    appSlug: "postforge",
    baseUrl: "http://localhost:3000",
    afterLoginPath: "/admin",
  };
  const secrets = {
    NEXTAUTH_SECRET: "secret",
    TWO_FACTOR_SECRET_ENCRYPTION_KEY: "2fa-key",
  };

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
