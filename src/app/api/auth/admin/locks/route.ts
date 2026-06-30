import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.adminLocks.GET;
export const POST = secureAuth.routes.adminLocks.POST;
