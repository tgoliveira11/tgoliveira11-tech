import Link from "next/link";
import type { Post } from "@/modules/posts/posts.types";
import { publicPostPath } from "@/modules/posts/slug";

export function ArticleNavigation({
  previous,
  next,
}: {
  previous: Post | null;
  next: Post | null;
}) {
  if (!previous && !next) {
    return null;
  }

  const linkClass =
    "group block rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]";

  return (
    <nav
      aria-label="Post navigation"
      className="mt-12 grid gap-4 border-t border-[var(--border)] pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link href={publicPostPath(previous.slug)} className={linkClass}>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Previous
          </span>
          <span className="mt-1 block font-medium group-hover:text-[var(--primary)]">
            ← {previous.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={publicPostPath(next.slug)} className={`${linkClass} sm:text-right`}>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Next
          </span>
          <span className="mt-1 block font-medium group-hover:text-[var(--primary)]">
            {next.title} →
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
