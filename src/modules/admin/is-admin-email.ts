import { readAdminEmail } from "@/lib/env";

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = readAdminEmail();
  if (!adminEmail) {
    return false;
  }

  const normalized = email?.trim().toLowerCase();
  return !!normalized && normalized === adminEmail;
}
