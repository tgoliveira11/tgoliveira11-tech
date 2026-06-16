import "server-only";
import { createSecureAuth } from "@tgoliveira/secure-auth/next";
import { db } from "@/db/client";
import { createEmailProvider } from "@/lib/email/email-provider-factory";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";
import { readEmailFrom } from "@/lib/env";
import { SECURE_AUTH_ADMIN_PATHS } from "@/modules/admin/secure-auth-admin-paths";

const envConfig = buildSecureAuthConfigFromEnv({
  appName: "PostForge",
  appSlug: "postforge",
  baseUrl: "http://localhost:3000",
  afterLoginPath: "/admin",
});

const emailFrom = readEmailFrom() ?? `${envConfig.app.name} <noreply@localhost>`;

export const secureAuth = createSecureAuth({
  db,
  ...envConfig,
  email: {
    from: emailFrom,
    provider: createEmailProvider(),
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
