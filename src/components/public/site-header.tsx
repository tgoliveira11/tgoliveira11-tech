import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PUBLIC_CONTENT_MAX_WIDTH_CLASS } from "./public-layout-constants";
import { SiteNav } from "./site-nav";

export function SiteHeader({ config }: { config: BlogConfig }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur">
      <div
        className={`mx-auto flex ${PUBLIC_CONTENT_MAX_WIDTH_CLASS} flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight transition hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
        >
          {config.title}
        </Link>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <SiteNav />
          <ThemeToggle compact />
        </div>
      </div>
    </header>
  );
}
