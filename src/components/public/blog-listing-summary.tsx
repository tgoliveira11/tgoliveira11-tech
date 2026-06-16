import { formatPublishedPostCount } from "@/modules/public/public-display";

export function BlogListingSummary({ totalPublishedPosts }: { totalPublishedPosts: number }) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[var(--muted)]">All published articles.</p>
      <p className="text-sm text-[var(--muted)]" aria-live="polite">
        {formatPublishedPostCount(totalPublishedPosts)}
      </p>
    </div>
  );
}
