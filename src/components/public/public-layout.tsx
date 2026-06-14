import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import type { BlogConfig } from "@/modules/public/blog-config";

export function PublicLayout({
  config,
  children,
}: {
  config: BlogConfig;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader config={config} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">{children}</main>
      <SiteFooter config={config} />
    </div>
  );
}
