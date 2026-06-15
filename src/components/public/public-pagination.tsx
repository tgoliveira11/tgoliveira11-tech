import Link from "next/link";

export function PublicPagination({
  basePath,
  page,
  totalPages,
  query,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams(query);
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass =
    "inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row"
    >
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span className="text-sm text-[var(--muted)]">← Previous</span>
      )}
      <span className="text-sm text-[var(--muted)]">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span className="text-sm text-[var(--muted)]">Next →</span>
      )}
    </nav>
  );
}

/** @deprecated Use PublicPagination */
export const Pagination = PublicPagination;
