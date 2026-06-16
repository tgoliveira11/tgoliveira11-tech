import type { ReactNode } from "react";
import Link from "next/link";

export function TopicCard({
  href,
  name,
  description,
  postCount,
}: {
  href: string;
  name: string;
  description?: string | null;
  postCount?: number;
}) {
  return (
    <Link
      href={href}
      className="block h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-lg font-medium">{name}</span>
        {postCount !== undefined ? (
          <span className="shrink-0 rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-xs text-[var(--muted)]">
            {postCount} {postCount === 1 ? "post" : "posts"}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
          {description}
        </p>
      ) : null}
    </Link>
  );
}

export function TopicCardGrid({ children }: { children: ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2">{children}</ul>;
}

export function TopicCardItem({ children }: { children: ReactNode }) {
  return <li className="h-full">{children}</li>;
}
