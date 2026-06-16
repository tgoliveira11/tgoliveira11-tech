import "server-only";
import { createSecureAuth } from "@tgoliveira/secure-auth/next";
import { APP_DEFAULTS } from "@/lib/auth/app-defaults";
import { db } from "@/db/client";
import { devEmailProvider } from "@/lib/email/dev-email-provider";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";
import { readEnv } from "@/lib/env/parse";
import { SECURE_AUTH_ADMIN_PATHS } from "@/modules/admin/secure-auth-admin-paths";
import { createSecureAuthServicesPatcher } from "@/lib/auth/patch-secure-auth-services";

type SecureAuthRouteHandler = (
  request: Request,
  context?: unknown
) => Response | Promise<Response>;

const envConfig = buildSecureAuthConfigFromEnv({
  appName: APP_DEFAULTS.name,
  appSlug: APP_DEFAULTS.slug,
  baseUrl: APP_DEFAULTS.baseUrl,
  afterLoginPath: "/admin",
});

const baseSecureAuth = createSecureAuth({
  db,
  ...envConfig,
  email: {
    from: readEnv(process.env, "EMAIL_FROM") ?? `${envConfig.app.name} <noreply@localhost>`,
    provider: devEmailProvider,
  },
  ui: {
    ...envConfig.ui,
    paths: {
      login: "/login",
      register: "/register",
      forgotPassword: "/forgot-password",
      resetPassword: "/reset-password",
      verifyEmail: "/verify-email",
      checkEmail: "/check-email",
      loginTwoFactor: "/login/2fa",
      loginComplete: "/login/complete",
      account: SECURE_AUTH_ADMIN_PATHS.account,
      security: SECURE_AUTH_ADMIN_PATHS.security,
      sessions: SECURE_AUTH_ADMIN_PATHS.sessions,
      accountDeleted: "/account-deleted",
    },
    messages: {
      loginTitle: "Sign in to PostForge",
      registerTitle: "Create your PostForge account",
      securitySettingsTitle: "PostForge security",
      sessionsSettingsTitle: "Active PostForge sessions",
      dashboardTitle: "PostForge dashboard",
    },
  },
});

const { ensurePatchedServices, wrapRoutes } = createSecureAuthServicesPatcher(() =>
  baseSecureAuth.getServices()
);

/** secure-auth instance with app-specific NextAuth cookie names on all API routes. */
export const secureAuth = {
  ...baseSecureAuth,
  getServices: ensurePatchedServices,
  routes: wrapRoutes(
    baseSecureAuth.routes as Record<string, Record<string, SecureAuthRouteHandler>>
  ),
};
