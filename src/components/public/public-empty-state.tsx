import type { ReactNode } from "react";
import Link from "next/link";

export function PublicEmptyState({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <section
      role="status"
      className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-10 text-center shadow-[var(--shadow-sm)]"
    >
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-6">
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--primary-hover)]"
          >
            {action.label}
          </Link>
        </div>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

/** @deprecated Use PublicEmptyState */
export const EmptyState = PublicEmptyState;
