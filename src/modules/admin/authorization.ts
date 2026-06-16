import "server-only";

import { getServerSession } from "next-auth";
import { forbidden, redirect } from "next/navigation";
import { ForbiddenError } from "@/lib/errors";
import { getAuthOptions } from "@/lib/auth/auth-options";
import { isAdminEmail } from "./is-admin-email";

export { isAdminEmail } from "./is-admin-email";

type AdminUser = {
  id: string;
  email: string | null;
};

async function getAuthenticatedAdminUser(): Promise<AdminUser | null> {
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user) {
    return null;
  }

  const user = session.user as { id?: string; email?: string | null };

  if (!user.id || !isAdminEmail(user.email)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function requireAdminSession() {
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = session.user as { id?: string; email?: string | null };

  if (!user.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(user.email)) {
    forbidden();
  }

  return {
    ...session,
    user: {
      id: user.id,
      email: user.email ?? null,
    },
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
