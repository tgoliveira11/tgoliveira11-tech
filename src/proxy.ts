import { NextResponse, type NextRequest } from "next/server";
import { createSecureAuthProxyHandler } from "@/lib/auth/secure-auth-proxy";
import { getLegacyPostRedirectPath } from "@/lib/legacy-post-redirect";

const secureAuthProxy = createSecureAuthProxyHandler();

export async function proxy(request: NextRequest) {
  const legacyTarget = getLegacyPostRedirectPath(request.nextUrl.pathname);
  if (legacyTarget) {
    const url = request.nextUrl.clone();
    url.pathname = legacyTarget;
    return NextResponse.redirect(url, 308);
  }

  if (secureAuthProxy) {
    return secureAuthProxy(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:slug(\\d{4}-\\d{2}-\\d{2}-[a-zA-Z0-9-]+)",
    "/:slug(\\d{4}-\\d{2}-\\d{2}-[a-zA-Z0-9-]+)/",
    "/login",
    "/register",
    "/forgot-password",
    "/login/complete",
    "/login/2fa",
    "/check-email",
    "/verify-email",
    "/reset-password",
  ],
};
