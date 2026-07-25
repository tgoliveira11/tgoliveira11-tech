import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";
import { getPublicSiteTitle } from "@/modules/public/public-site-config";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AdminConvenienceLink } from "./admin-convenience-link";
import { SiteNav } from "./site-nav";

export function SiteHeader({
  config,
  showAdminLink = false,
}: {
  config: BlogConfig;
  showAdminLink?: boolean;
}) {
  const siteTitle = getPublicSiteTitle(config);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-2.5 sm:px-6 sm:py-3.5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 md:grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-0">
          <Link
            href="/"
            className="min-w-0 truncate text-base font-semibold tracking-tight transition hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] sm:text-lg lg:shrink-0"
          >
            {siteTitle}
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-2 md:justify-between lg:justify-end">
            <div className="flex shrink-0 items-center md:hidden">
              {showAdminLink ? <AdminConvenienceLink /> : null}
            </div>
            <div className="min-w-0 md:flex-1">
              <SiteNav />
            </div>
            <div className="hidden shrink-0 items-center gap-2 md:flex">
              {showAdminLink ? <AdminConvenienceLink /> : null}
              <ThemeToggle compact />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
