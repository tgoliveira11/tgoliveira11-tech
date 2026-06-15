import type { ReactNode } from "react";

export function PublicEmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
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
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

/** @deprecated Use PublicEmptyState */
export const EmptyState = PublicEmptyState;
