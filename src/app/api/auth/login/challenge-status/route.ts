import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.loginChallengeStatus.GET;
