import "server-only";

import type { NextAuthOptions } from "next-auth";
import { secureAuth } from "@/lib/auth/secure-auth";
import { augmentAuthOptionsWithAppCookies } from "@/lib/auth/next-auth-cookies";

/** NextAuth options with app-specific cookie names (must match the [...nextauth] route). */
export async function getAuthOptions(): Promise<NextAuthOptions> {
  const services = await secureAuth.getServices();
  return augmentAuthOptionsWithAppCookies(services.getAuthOptions(), services.config);
}
