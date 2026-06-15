import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.account.GET;
export const DELETE = secureAuth.routes.account.DELETE;
