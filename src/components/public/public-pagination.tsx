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

  const activePageClass =
    "inline-flex min-w-9 items-center justify-center rounded-lg border border-[var(--primary)] bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white";

  const pageLinkClass =
    "inline-flex min-w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium transition hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

  const pageNumbers = buildPageNumbers(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row"
    >
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={linkClass} aria-label="Go to previous page">
          ← Previous
        </Link>
      ) : (
        <span className="text-sm text-[var(--muted)]" aria-hidden="true">
          ← Previous
        </span>
      )}

      <div className="flex flex-col items-center gap-3">
        <span className="text-sm text-[var(--muted)]">
          Page {page} of {totalPages}
        </span>
        {pageNumbers.length > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pageNumbers.map((pageNumber) =>
              pageNumber === page ? (
                <span key={pageNumber} className={activePageClass} aria-current="page">
                  {pageNumber}
                </span>
              ) : (
                <Link
                  key={pageNumber}
                  href={buildHref(pageNumber)}
                  className={pageLinkClass}
                  aria-label={`Go to page ${pageNumber}`}
                >
                  {pageNumber}
                </Link>
              )
            )}
          </div>
        ) : null}
      </div>

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={linkClass} aria-label="Go to next page">
          Next →
        </Link>
      ) : (
        <span className="text-sm text-[var(--muted)]" aria-hidden="true">
          Next →
        </span>
      )}
    </nav>
  );
}

function buildPageNumbers(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
}

/** @deprecated Use PublicPagination */
export const Pagination = PublicPagination;
