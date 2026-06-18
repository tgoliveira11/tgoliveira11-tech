import { describe, expect, it } from "vitest";
import { buildSecureAuthConfigFromEnv } from "./secure-auth-from-env";

describe("buildSecureAuthConfigFromEnv auth redirects", () => {
  it("defaults guest-page redirects to /admin via afterLoginPath", () => {
    const config = buildSecureAuthConfigFromEnv(
      {
        appName: "tgoliveira11-tech",
        appSlug: "tgoliveira11-tech",
        baseUrl: "http://localhost:3011",
        afterLoginPath: "/admin",
      },
      {
        NEXTAUTH_SECRET: "test-secret",
      }
    );

    expect(config.auth.afterLoginPath).toBe("/admin");
    expect(config.auth.authenticatedRedirectPath).toBe("/admin");
    expect(config.auth.redirectAuthenticatedFromGuestPages).toBe(true);
  });

  it("maps optional authenticated redirect env overrides", () => {
    const config = buildSecureAuthConfigFromEnv(
      {
        appName: "tgoliveira11-tech",
        appSlug: "tgoliveira11-tech",
        baseUrl: "http://localhost:3011",
        afterLoginPath: "/admin",
      },
      {
        AUTH_AUTHENTICATED_REDIRECT_PATH: "/custom-home",
        AUTH_REDIRECT_AUTHENTICATED_FROM_GUEST_PAGES: "false",
      }
    );

    expect(config.auth.authenticatedRedirectPath).toBe("/custom-home");
    expect(config.auth.redirectAuthenticatedFromGuestPages).toBe(false);
  });
});

describe("buildSecureAuthConfigFromEnv API security", () => {
  it("defaults account API verification and same-origin protection", () => {
    const config = buildSecureAuthConfigFromEnv(
      {
        appName: "tgoliveira11-tech",
        appSlug: "tgoliveira11-tech",
        baseUrl: "http://localhost:3011",
        afterLoginPath: "/admin",
      },
      {}
    );

    expect(config.accountPolicy?.requireEmailVerificationForAccountApis).toBe(true);
    expect(config.security?.sameOriginProtection?.enabled).toBe(true);
    expect(config.security?.sameOriginProtection?.allowedOrigins).toEqual([]);
    expect(config.debug?.exposeTraceRoute).toBe(false);
  });

  it("maps optional API security env overrides", () => {
    const config = buildSecureAuthConfigFromEnv(
      {
        appName: "tgoliveira11-tech",
        appSlug: "tgoliveira11-tech",
        baseUrl: "http://localhost:3011",
        afterLoginPath: "/admin",
      },
      {
        EMAIL_VERIFICATION_REQUIRE_FOR_ACCOUNT_APIS: "false",
        AUTH_SAME_ORIGIN_PROTECTION_ENABLED: "false",
        AUTH_ALLOWED_ORIGINS: "https://preview.example.com, https://staging.example.com",
        AUTH_DEBUG_EXPOSE_TRACE_ROUTE: "true",
      }
    );

    expect(config.accountPolicy?.requireEmailVerificationForAccountApis).toBe(false);
    expect(config.security?.sameOriginProtection?.enabled).toBe(false);
    expect(config.security?.sameOriginProtection?.allowedOrigins).toEqual([
      "https://preview.example.com",
      "https://staging.example.com",
    ]);
    expect(config.debug?.exposeTraceRoute).toBe(true);
  });
});
