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
