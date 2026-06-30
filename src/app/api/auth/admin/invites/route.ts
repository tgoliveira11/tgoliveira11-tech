import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.adminInvites.GET;
export const POST = secureAuth.routes.adminInvites.POST;
export const DELETE = secureAuth.routes.adminInvites.DELETE;
