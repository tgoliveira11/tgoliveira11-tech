import { secureAuth } from "@/lib/auth/secure-auth";

export const POST = secureAuth.routes.loginOauth2faComplete.POST;
