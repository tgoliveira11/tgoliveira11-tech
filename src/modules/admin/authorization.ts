import "server-only";

import { getServerSession } from "next-auth";
import { forbidden, redirect } from "next/navigation";
import { ForbiddenError } from "@/lib/errors";
import { secureAuth } from "@/lib/auth/secure-auth";
import { isAdminEmail } from "./is-admin-email";

export { isAdminEmail } from "./is-admin-email";

type AdminUser = {
  id: string;
  email: string | null;
};

async function getAuthenticatedAdminUser(): Promise<AdminUser | null> {
  const services = await secureAuth.getServices();
  const session = await getServerSession(services.getAuthOptions());

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
  const services = await secureAuth.getServices();
  const session = await getServerSession(services.getAuthOptions());

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
