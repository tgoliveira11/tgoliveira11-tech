import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ForbiddenError } from "@/lib/errors";
import { secureAuth } from "@/lib/auth/secure-auth";
import { isAdminEmail } from "./is-admin-email";

export { isAdminEmail } from "./is-admin-email";

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
    throw new ForbiddenError("Admin access required");
  }

  return { ...session, user };
}
