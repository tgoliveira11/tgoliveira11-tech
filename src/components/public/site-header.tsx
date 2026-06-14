import Link from "next/link";
import type { BlogConfig } from "@/modules/public/blog-config";

export function SiteHeader({ config }: { config: BlogConfig }) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-xl font-semibold tracking-tight hover:text-[var(--primary)]">
            {config.title}
          </Link>
          <p className="mt-1 text-sm text-[var(--muted)]">{config.description}</p>
        </div>
        <nav aria-label="Main navigation">
          <ul className="flex flex-wrap gap-4 text-sm font-medium">
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
