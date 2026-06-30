import "server-only";

import { getServerSession } from "next-auth";
import type { RequireAdminFn } from "@tgoliveira/outpost/admin";
import { bootstrapSecureAuthAdmin } from "@/lib/auth/bootstrap-secure-auth-admin";
import { getAuthOptions } from "@/lib/auth/auth-options";
import { outpostAdminForbidden } from "@/lib/outpost/outpost-admin-forbidden";
import { isAuthorizedAdmin } from "@/modules/admin/is-authorized-admin";

/** Gate Outpost admin HTTP routes with the same policy as `/admin`. */
export const requireOutpostAdmin: RequireAdminFn = async () => {
  await bootstrapSecureAuthAdmin();

  const session = await getServerSession(await getAuthOptions());
  const user = session?.user as { id?: string; email?: string | null; role?: string | null };

  if (!user?.id) {
    throw outpostAdminForbidden("Authentication required");
  }

  const normalized = {
    id: user.id,
    email: user.email ?? null,
    role: user.role ?? null,
  };

  if (!(await isAuthorizedAdmin(normalized))) {
    throw outpostAdminForbidden("Admin access required");
  }

  return { actor: user.id };
};
