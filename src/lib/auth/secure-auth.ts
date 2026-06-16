import "server-only";
import { createSecureAuth } from "@tgoliveira/secure-auth/next";
import { APP_DEFAULTS } from "@/lib/auth/app-defaults";
import { db } from "@/db/client";
import { createEmailProvider } from "@/lib/email/email-provider-factory";
import { createSecureAuthEmailTemplates } from "@/lib/email/templates";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";
import { readEmailFrom } from "@/lib/env";
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

const emailFrom = readEmailFrom() ?? `${envConfig.app.name} <noreply@localhost>`;

const baseSecureAuth = createSecureAuth({
  db,
  ...envConfig,
  email: {
    from: emailFrom,
    provider: createEmailProvider(),
    templates: createSecureAuthEmailTemplates(),
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

const wrappedRoutes = wrapRoutes(
  baseSecureAuth.routes as Record<string, Record<string, SecureAuthRouteHandler>>
);

/** secure-auth instance with app-specific NextAuth cookie names on all API routes. */
export const secureAuth = {
  config: baseSecureAuth.config,
  uiConfig: baseSecureAuth.uiConfig,
  get ui() {
    return baseSecureAuth.ui;
  },
  getPublicUIConfig: () => baseSecureAuth.getPublicUIConfig(),
  getServices: ensurePatchedServices,
  routes: wrappedRoutes,
};
