import { secureAuth } from "@/lib/auth/secure-auth";

export const GET = secureAuth.routes.nextAuth.GET;
export const POST = secureAuth.routes.nextAuth.POST;
