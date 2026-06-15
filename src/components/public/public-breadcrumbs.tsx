import Link from "next/link";
import type { ReactNode } from "react";

export function PublicBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] transition hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}

export function PublicBreadcrumbs({
  items,
}: {
  items: Array<{ href?: string; label: string }>;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--muted)]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--primary)]">
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--foreground)]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PublicActionLinks({
  links,
}: {
  links: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
      {links.map((link) => {
        const isPrimary = link.variant === "primary" || link.variant === undefined;
        return (
          <Link
            key={link.href + link.label}
            href={link.href}
            className={
              isPrimary
                ? "inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                : "inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-2.5 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
