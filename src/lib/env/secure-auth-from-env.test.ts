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
