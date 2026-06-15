import type { ReactNode } from "react";

export function EditorCard({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 ${className}`}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-xs text-[var(--muted)]">{description}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}
