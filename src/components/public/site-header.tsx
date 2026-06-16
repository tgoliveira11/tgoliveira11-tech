import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";
import {
  getPublicSiteTitle,
  PUBLIC_SITE_CONFIG,
} from "@/modules/public/public-site-config";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PUBLIC_CONTENT_MAX_WIDTH_CLASS } from "./public-layout-constants";
import { SearchForm } from "./search-form";
import { SiteNav } from "./site-nav";

export function SiteHeader({ config }: { config: BlogConfig }) {
  const siteTitle = getPublicSiteTitle(config);
  const hideNavSearch = PUBLIC_SITE_CONFIG.header.hideNavSearchWhenHeaderSearchVisible;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
      <div
        className={`mx-auto ${PUBLIC_CONTENT_MAX_WIDTH_CLASS} px-4 py-3 sm:px-6 sm:py-3.5`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex min-w-0 items-center justify-between gap-3 md:shrink-0">
            <Link
              href="/"
              className="truncate text-lg font-semibold tracking-tight transition hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              {siteTitle}
            </Link>

            <div className="flex shrink-0 items-center gap-2 md:hidden">
              <SiteNav hideSearchLink={hideNavSearch} />
              <ThemeToggle compact />
            </div>
          </div>

          <div className="min-w-0 w-full flex-1 md:max-w-sm lg:max-w-md">
            <SearchForm variant="header" />
          </div>

          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <SiteNav hideSearchLink={hideNavSearch} />
            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </header>
  );
}
