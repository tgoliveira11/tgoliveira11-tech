import type { NextAuthOptions } from "next-auth";
import type { SecureAuthConfig } from "@tgoliveira/secure-auth";
import { resolveAuthCookiePrefix } from "@/lib/auth/auth-cookie-prefix";

type NextAuthCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  secure: boolean;
  maxAge?: number;
};

type NextAuthCookieDefinition = {
  name: string;
  options: NextAuthCookieOptions;
};

function buildCookieName(
  prefix: string,
  suffix: string,
  useSecureCookies: boolean,
  useHostPrefix = false
): string {
  if (useHostPrefix && useSecureCookies) {
    return `__Host-${prefix}.${suffix}`;
  }
  if (useSecureCookies) {
    return `__Secure-${prefix}.${suffix}`;
  }
  return `${prefix}.${suffix}`;
}

function baseCookieOptions(useSecureCookies: boolean): NextAuthCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: useSecureCookies,
  };
}

export function buildNextAuthCookies(
  prefix: string,
  useSecureCookies: boolean
): NonNullable<NextAuthOptions["cookies"]> {
  const options = baseCookieOptions(useSecureCookies);

  const cookies: Record<string, NextAuthCookieDefinition> = {
    sessionToken: {
      name: buildCookieName(prefix, "next-auth.session-token", useSecureCookies),
      options,
    },
    callbackUrl: {
      name: buildCookieName(prefix, "next-auth.callback-url", useSecureCookies),
      options,
    },
    csrfToken: {
      name: buildCookieName(prefix, "next-auth.csrf-token", useSecureCookies, true),
      options,
    },
    pkceCodeVerifier: {
      name: buildCookieName(prefix, "next-auth.pkce.code_verifier", useSecureCookies),
      options: { ...options, maxAge: 60 * 15 },
    },
    state: {
      name: buildCookieName(prefix, "next-auth.state", useSecureCookies),
      options: { ...options, maxAge: 60 * 15 },
    },
    nonce: {
      name: buildCookieName(prefix, "next-auth.nonce", useSecureCookies),
      options,
    },
  };

  return cookies;
}

export function resolveNextAuthCookieSecure(config: SecureAuthConfig): boolean {
  return config.server?.cookieSecure ?? process.env.NODE_ENV === "production";
}

export function augmentAuthOptionsWithAppCookies(
  options: NextAuthOptions,
  config: SecureAuthConfig
): NextAuthOptions {
  const prefix = resolveAuthCookiePrefix(process.env, config.app.slug);
  const useSecureCookies = resolveNextAuthCookieSecure(config);

  return {
    ...options,
    useSecureCookies,
    cookies: buildNextAuthCookies(prefix, useSecureCookies),
  };
}
