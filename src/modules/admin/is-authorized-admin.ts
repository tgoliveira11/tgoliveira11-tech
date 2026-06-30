import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { isAdminEmail } from "./is-admin-email";

export type AdminAccessUser = {
  id: string;
  email: string | null;
  role?: string | null;
};

/** Blog + secure-auth admin: configured bootstrap email or `users.role === "admin"`. */
export async function isAuthorizedAdmin(user: AdminAccessUser): Promise<boolean> {
  if (isAdminEmail(user.email)) {
    return true;
  }

  if (user.role === "admin") {
    return true;
  }

  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return row?.role === "admin";
}
