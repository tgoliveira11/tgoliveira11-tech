import type { AuthPaths } from "@tgoliveira/secure-auth/react";
import { secureAuthAdminPaths } from "@/modules/admin/secure-auth-admin-paths";

/** Base path for secure-auth admin panel pages (distinct from blog dashboard `/admin`). */
export const SECURE_AUTH_CORE_BASE = "/admin/core";

export const secureAuthCorePaths: AuthPaths = {
  ...secureAuthAdminPaths,
  adminPanel: SECURE_AUTH_CORE_BASE,
};

export const SECURE_AUTH_ADMIN_API_BASE = "/api/auth";
