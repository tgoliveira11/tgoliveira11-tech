import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.adminApiKeys.GET;
export const POST = secureAuth.routes.adminApiKeys.POST;
export const DELETE = secureAuth.routes.adminApiKeys.DELETE;
