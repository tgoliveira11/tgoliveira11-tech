import {
  buildMiddlewareConfigFromUi,
  createSecureAuthMiddleware,
} from "@tgoliveira/secure-auth/next/middleware";
import { secureAuth } from "@/lib/auth/secure-auth";

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret) {
  throw new Error("NEXTAUTH_SECRET is required for secure-auth middleware");
}

export const middleware = createSecureAuthMiddleware({
  ...buildMiddlewareConfigFromUi(secureAuth.uiConfig, nextAuthSecret),
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
