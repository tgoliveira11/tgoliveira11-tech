import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.adminWaitlist.GET;
export const POST = secureAuth.routes.adminWaitlist.POST;
