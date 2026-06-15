import { APP_DEFAULTS } from "@/lib/auth/app-defaults";
import { readEnv, readFirstEnv } from "@/lib/env/parse";

/** Stable per-app prefix for NextAuth and secure-auth cookie names. */
export function resolveAuthCookiePrefix(
  env: NodeJS.ProcessEnv = process.env,
  fallbackAppSlug: string = APP_DEFAULTS.slug
): string {
  return (
    readFirstEnv(env, ["AUTH_COOKIE_PREFIX"]) ??
    readEnv(env, "APP_SLUG") ??
    fallbackAppSlug ??
    APP_DEFAULTS.authCookiePrefixFallback
  );
}
