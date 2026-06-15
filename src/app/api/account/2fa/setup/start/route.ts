import { secureAuth } from "@/lib/auth/secure-auth";

export const POST = secureAuth.routes.twoFactorSetupStart.POST;
