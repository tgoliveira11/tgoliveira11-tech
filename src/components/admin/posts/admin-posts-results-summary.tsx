import { formatAdminPostsCountLabel } from "@/modules/admin/admin-posts-filters";

export function AdminPostsResultsSummary({
  totalItems,
  hasFilters,
}: {
  totalItems: number;
  hasFilters: boolean;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="text-sm text-[var(--muted)]" aria-live="polite">
        {formatAdminPostsCountLabel(totalItems, hasFilters)}
      </p>
    </div>
  );
}
