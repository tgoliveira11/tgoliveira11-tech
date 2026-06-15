import Link from "next/link";

export function PublicSectionHeading({
  id,
  title,
  description,
  action,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-2xl text-[var(--muted)]">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="shrink-0 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
