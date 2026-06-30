import "server-only";

import { getServerSession } from "next-auth";
import { forbidden, redirect } from "next/navigation";
import { ForbiddenError } from "@/lib/errors";
import { bootstrapSecureAuthAdmin } from "@/lib/auth/bootstrap-secure-auth-admin";
import { getAuthOptions } from "@/lib/auth/auth-options";
import { isAuthorizedAdmin } from "./is-authorized-admin";

export { isAdminEmail } from "./is-admin-email";
export { isAuthorizedAdmin } from "./is-authorized-admin";

type AdminUser = {
  id: string;
  email: string | null;
  role?: string | null;
};

async function getAuthenticatedAdminUser(): Promise<AdminUser | null> {
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user) {
    return null;
  }

  const user = session.user as { id?: string; email?: string | null; role?: string | null };

  if (!user.id) {
    return null;
  }

  const normalized: AdminUser = {
    id: user.id,
    email: user.email ?? null,
    role: user.role ?? null,
  };

  await bootstrapSecureAuthAdmin();

  if (!(await isAuthorizedAdmin(normalized))) {
    return null;
  }

  return normalized;
}

export async function requireAdminSession() {
  await bootstrapSecureAuthAdmin();

  const session = await getServerSession(await getAuthOptions());

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = session.user as { id?: string; email?: string | null; role?: string | null };

  if (!user.id) {
    redirect("/login?callbackUrl=/admin");
  }

  const normalized: AdminUser = {
    id: user.id,
    email: user.email ?? null,
    role: user.role ?? null,
  };

  if (!(await isAuthorizedAdmin(normalized))) {
    forbidden();
  }

  return {
    ...session,
    user: normalized,
  };
}

export async function requireAdminApiSession() {
  const user = await getAuthenticatedAdminUser();
  if (!user) {
    throw new ForbiddenError("Admin access required");
  }
  return { user };
}

/** Public convenience only — does not imply admin authorization. */
export async function hasAuthenticatedSession(): Promise<boolean> {
  const session = await getServerSession(await getAuthOptions());
  const user = session?.user as { id?: string } | undefined;
  return Boolean(user?.id);
}
