import { secureAuth } from "@/lib/auth/secure-auth";

export const DELETE = secureAuth.routes.sessionById.DELETE;
