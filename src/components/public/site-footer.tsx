import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";
import { PUBLIC_CONTENT_MAX_WIDTH_CLASS } from "./public-layout-constants";

export function SiteFooter({ config }: { config: BlogConfig }) {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]">
      <div
        className={`mx-auto ${PUBLIC_CONTENT_MAX_WIDTH_CLASS} flex flex-col gap-6 px-4 py-10 text-sm text-[var(--muted)] sm:px-6`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-[var(--foreground)]">{config.title}</p>
            <p className="mt-1 max-w-xl">{config.description}</p>
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              <li>
                <Link href="/blog" className="hover:text-[var(--primary)]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/tags" className="hover:text-[var(--primary)]">
                  Tags
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[var(--primary)]">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[var(--primary)]">
                  Search
                </Link>
              </li>
              <li>
                <a href="/rss.xml" className="hover:text-[var(--primary)]">
                  RSS
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="border-t border-[var(--border)] pt-6">
          &copy; {new Date().getFullYear()} {config.title}
        </p>
      </div>
    </footer>
  );
}
