import type { ReactNode } from "react";
import Link from "next/link";

export function TopicPill({
  href,
  name,
  count,
}: {
  href: string;
  name: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <span>#{name}</span>
      {count !== undefined ? (
        <span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-xs text-[var(--muted)]">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export function TopicPillGrid({ children }: { children: ReactNode }) {
  return <ul className="flex flex-wrap gap-3">{children}</ul>;
}

export function TopicPillItem({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}
