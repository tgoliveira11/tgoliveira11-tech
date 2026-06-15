import type { ReactNode } from "react";
import Link from "next/link";

export function TopicCard({
  href,
  name,
  description,
}: {
  href: string;
  name: string;
  description?: string | null;
}) {
  return (
    <Link
      href={href}
      className="block h-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)] hover:shadow-[var(--shadow-sm)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
    >
      <span className="text-lg font-medium">{name}</span>
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
