import Link from "next/link";

export function Pagination({
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

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm">
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className="text-[var(--primary)] hover:underline">
          Previous
        </Link>
      ) : (
        <span className="text-[var(--muted)]">Previous</span>
      )}
      <span className="text-[var(--muted)]">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className="text-[var(--primary)] hover:underline">
          Next
        </Link>
      ) : (
        <span className="text-[var(--muted)]">Next</span>
      )}
    </nav>
  );
}
