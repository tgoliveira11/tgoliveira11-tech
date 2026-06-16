import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";
import { POSTFORGE_REPO_URL } from "@/modules/public/postforge-meta";
import {
  getPublicSiteTitle,
  PUBLIC_SITE_CONFIG,
} from "@/modules/public/public-site-config";
import { PUBLIC_CONTENT_MAX_WIDTH_CLASS } from "./public-layout-constants";

export function SiteFooter({ config }: { config: BlogConfig }) {
  const siteTitle = getPublicSiteTitle(config);
  const { showDescription, compact } = PUBLIC_SITE_CONFIG.footer;

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--card)]">
      <div
        className={`mx-auto ${PUBLIC_CONTENT_MAX_WIDTH_CLASS} flex flex-col gap-4 px-4 text-sm text-[var(--muted)] sm:px-6 ${compact ? "py-6" : "py-10"}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-[var(--foreground)]">{siteTitle}</p>
            {showDescription ? (
              <p className="mt-1 max-w-xl">{config.description}</p>
            ) : null}
          </div>
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              <li>
                <Link href="/blog" className="hover:text-[var(--primary)]">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--primary)]">
                  About
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
                <a
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--primary)]"
                >
                  RSS
                </a>
              </li>
              <li>
                <a
                  href={PUBLIC_SITE_CONFIG.footer.ltgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--primary)]"
                >
                  LTG
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div
          className={`flex flex-col gap-2 border-t border-[var(--border)] sm:flex-row sm:items-center sm:justify-between ${compact ? "pt-4" : "pt-6 gap-3"}`}
        >
          <p>
            &copy; {new Date().getFullYear()} {siteTitle}
          </p>
          <p className="text-xs sm:text-sm">
            Powered by{" "}
            <a
              href={POSTFORGE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--foreground)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            >
              PostForge
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
