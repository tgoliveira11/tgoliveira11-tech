import "server-only";

import type { NextAuthOptions } from "next-auth";
import { secureAuth } from "@/lib/auth/secure-auth";

/** NextAuth options with app-specific cookie names (shared by pages and API routes). */
export async function getAuthOptions(): Promise<NextAuthOptions> {
  const services = await secureAuth.getServices();
  return services.getAuthOptions();
}
