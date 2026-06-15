import type { AuthPaths } from "@tgoliveira/secure-auth/react";

/** Canonical PostForge admin routes for secure-auth settings pages. */
export const SECURE_AUTH_ADMIN_PATHS = {
  account: "/admin/account",
  security: "/admin/security",
  sessions: "/admin/sessions",
} as const;

export const secureAuthAdminPaths: AuthPaths = {
  accountSettings: SECURE_AUTH_ADMIN_PATHS.account,
  securitySettings: SECURE_AUTH_ADMIN_PATHS.security,
  sessionsSettings: SECURE_AUTH_ADMIN_PATHS.sessions,
};
