import { SECURE_AUTH_ADMIN_PATHS } from "@/modules/admin/secure-auth-admin-paths";

/** Canonical auth UI paths shared by createSecureAuth and proxy middleware. */
export const SECURE_AUTH_UI_PATHS = {
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
} as const;
