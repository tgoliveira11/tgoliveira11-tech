import type { ReactNode } from "react";
import { hasAuthenticatedSession } from "@/modules/admin/authorization";
import { PUBLIC_CONTENT_MAX_WIDTH_CLASS } from "./public-layout-constants";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { BlogConfig } from "@/modules/public/blog-config";

export async function PublicLayout({
  config,
  children,
}: {
  config: BlogConfig;
  children: ReactNode;
}) {
  const showAdminLink = await hasAuthenticatedSession();

  return (
    <div className="public-site flex min-h-screen flex-col">
      <SiteHeader config={config} showAdminLink={showAdminLink} />
      <main className={`mx-auto w-full ${PUBLIC_CONTENT_MAX_WIDTH_CLASS} flex-1 px-4 py-10 sm:px-6`}>
        {children}
      </main>
      <SiteFooter config={config} />
    </div>
  );
}
