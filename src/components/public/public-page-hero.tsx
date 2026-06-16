import type { ReactNode } from "react";

export function PublicPageHero({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
}) {
  return (
    <header className="public-page-hero border-b border-[var(--border)] pb-6">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
      {children ? <div className="mt-6 max-w-2xl">{children}</div> : null}
    </header>
  );
}
