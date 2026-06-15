import "server-only";

import NextAuth from "next-auth";
import { createNextAuthRouteHandlers } from "@tgoliveira/secure-auth/next";
import { secureAuth } from "@/lib/auth/secure-auth";
import { augmentAuthOptionsWithAppCookies } from "@/lib/auth/next-auth-cookies";

const handlers = createNextAuthRouteHandlers(NextAuth, async () => {
  const services = await secureAuth.getServices();
  const getBaseAuthOptions = services.getAuthOptions.bind(services);

  return {
    ...services,
    getAuthOptions: () =>
      augmentAuthOptionsWithAppCookies(getBaseAuthOptions(), services.config),
  };
});

export const nextAuthGET = handlers.GET;
export const nextAuthPOST = handlers.POST;
