import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-[var(--muted)]">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
