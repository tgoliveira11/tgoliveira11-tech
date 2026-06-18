import type { NextRequest } from "next/server";
import {
  buildMiddlewareConfigFromUi,
  buildPublicUIConfig,
  createSecureAuthMiddleware,
} from "@tgoliveira/secure-auth/next/middleware";
import type { SecureAuthConfig } from "@tgoliveira/secure-auth";
import { APP_DEFAULTS } from "@/lib/auth/app-defaults";
import { SECURE_AUTH_UI_PATHS } from "@/lib/auth/secure-auth-ui-paths";
import { buildSecureAuthConfigFromEnv } from "@/lib/env/secure-auth-from-env";

export function createSecureAuthProxyHandler():
  | ((request: NextRequest) => Promise<Response>)
  | null {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
  if (!nextAuthSecret) {
    return null;
  }

  const envSlice = buildSecureAuthConfigFromEnv({
    appName: APP_DEFAULTS.name,
    appSlug: APP_DEFAULTS.slug,
    baseUrl: APP_DEFAULTS.baseUrl,
    afterLoginPath: "/admin",
  });

  const secureAuthConfig = {
    ...envSlice,
    ui: {
      ...envSlice.ui,
      paths: SECURE_AUTH_UI_PATHS,
    },
  } as unknown as SecureAuthConfig;

  const uiConfig = buildPublicUIConfig(secureAuthConfig);
  const middlewareConfig = buildMiddlewareConfigFromUi(uiConfig, nextAuthSecret);

  return createSecureAuthMiddleware(middlewareConfig);
}
