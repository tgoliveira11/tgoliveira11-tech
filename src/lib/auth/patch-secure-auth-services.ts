import type { SecureAuthServices } from "@tgoliveira/secure-auth";
import { augmentAuthOptionsWithAppCookies } from "@/lib/auth/next-auth-cookies";
import { patchSecureAuthEmailTemplates } from "@/lib/auth/patch-secure-auth-email-templates";

const PATCHED = Symbol("appAuthCookiesPatched");

type RouteHandler = (request: Request, context?: unknown) => Response | Promise<Response>;

/** Apply app-specific NextAuth cookie names to the shared secure-auth services instance. */
export function patchSecureAuthServices(services: SecureAuthServices): SecureAuthServices {
  patchSecureAuthEmailTemplates(services);

  const getAuthOptions = services.getAuthOptions as typeof services.getAuthOptions & {
    [PATCHED]?: boolean;
  };

  if (getAuthOptions[PATCHED]) {
    return services;
  }

  const getBaseAuthOptions = services.getAuthOptions.bind(services);
  const patchedGetAuthOptions = () =>
    augmentAuthOptionsWithAppCookies(getBaseAuthOptions(), services.config);
  (patchedGetAuthOptions as typeof getAuthOptions & { [PATCHED]?: boolean })[PATCHED] = true;

  Object.assign(services, { getAuthOptions: patchedGetAuthOptions });

  return services;
}

export function createSecureAuthServicesPatcher(
  getServices: () => Promise<SecureAuthServices>
) {
  let patchPromise: Promise<SecureAuthServices> | null = null;

  async function ensurePatchedServices(): Promise<SecureAuthServices> {
    if (!patchPromise) {
      patchPromise = getServices().then(patchSecureAuthServices);
    }
    return patchPromise;
  }

  function wrapRouteHandler(handler: RouteHandler): RouteHandler {
    return async (request, context) => {
      await ensurePatchedServices();
      return handler(request, context);
    };
  }

  function wrapRoutes<T extends Record<string, Record<string, RouteHandler>>>(routes: T): T {
    const wrapped = {} as T;

    for (const [routeKey, handlers] of Object.entries(routes)) {
      const wrappedHandlers = {} as Record<string, RouteHandler>;

      for (const [method, handler] of Object.entries(handlers)) {
        wrappedHandlers[method] = wrapRouteHandler(handler);
      }

      wrapped[routeKey as keyof T] = wrappedHandlers as T[keyof T];
    }

    return wrapped;
  }

  return { ensurePatchedServices, wrapRoutes };
}
