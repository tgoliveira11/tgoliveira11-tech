import { NextResponse, type NextRequest } from "next/server";
import { getLegacyPostRedirectPath } from "@/lib/legacy-post-redirect";

export function proxy(request: NextRequest) {
  const targetPath = getLegacyPostRedirectPath(request.nextUrl.pathname);
  if (!targetPath) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = targetPath;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: [
    "/:slug(\\d{4}-\\d{2}-\\d{2}-[a-zA-Z0-9-]+)",
    "/:slug(\\d{4}-\\d{2}-\\d{2}-[a-zA-Z0-9-]+)/",
  ],
};
