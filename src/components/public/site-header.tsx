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
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div className="flex min-w-0 items-center justify-between gap-3 lg:shrink-0">
            <Link
              href="/"
              className="min-w-0 truncate text-lg font-semibold tracking-tight transition hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              {siteTitle}
            </Link>

            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              {showAdminLink ? <AdminConvenienceLink /> : null}
              <ThemeToggle compact />
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="-mx-2 min-w-0 flex-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SiteNav />
            </div>
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              {showAdminLink ? <AdminConvenienceLink /> : null}
              <ThemeToggle compact />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
