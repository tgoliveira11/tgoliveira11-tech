import "server-only";
import { createSecureAuth } from "@tgoliveira/secure-auth/next";
import { APP_DEFAULTS } from "@/lib/auth/app-defaults";
import { db } from "@/db/client";
import { createEmailProvider } from "@/lib/email/email-provider-factory";
import { createSecureAuthEmailTemplates } from "@/lib/email/templates";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";
import { readEmailFrom } from "@/lib/env";
import { createSecureAuthServicesPatcher } from "@/lib/auth/patch-secure-auth-services";
import { SECURE_AUTH_UI_PATHS } from "@/lib/auth/secure-auth-ui-paths";

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
    paths: SECURE_AUTH_UI_PATHS,
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
