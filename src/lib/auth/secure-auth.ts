import "server-only";
import { createSecureAuth } from "@tgoliveira/secure-auth/next";
import { db } from "@/db/client";
import { devEmailProvider } from "@/lib/email/dev-email-provider";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";
import { readEnv } from "@/lib/env/parse";

const envConfig = buildSecureAuthConfigFromEnv({
  appName: "PostForge",
  appSlug: "postforge",
  baseUrl: "http://localhost:3000",
  afterLoginPath: "/admin",
});

export const secureAuth = createSecureAuth({
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
      account: "/settings/account",
      security: "/settings/security",
      sessions: "/settings/sessions",
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
