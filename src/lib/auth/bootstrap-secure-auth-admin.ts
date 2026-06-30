import "server-only";

import { secureAuth } from "@/lib/auth/secure-auth";

let bootstrapPromise: Promise<void> | null = null;

/** Promote `admin.bootstrapEmail` when no admin exists yet (safe to call repeatedly). */
export async function bootstrapSecureAuthAdmin(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const services = await secureAuth.getServices();
      await services.adminService.bootstrapAdminIfNeeded();
    })().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
