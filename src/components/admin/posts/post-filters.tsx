import Link from "next/link";
import { TagFilterCombobox } from "@/components/admin/posts/tag-filter-combobox";
import {
  ADMIN_POSTS_RESET_PATH,
  formatAdminPostsCountLabel,
} from "@/modules/admin/admin-posts-filters";
import type { AdminPostsFilterParams } from "@/modules/admin/admin-posts-filter-url";
import type { Category } from "@/modules/categories/categories.types";
import type { PostStatus } from "@/modules/posts/posts.types";
import type { Tag } from "@/modules/tags/tags.types";

const statuses: Array<PostStatus | ""> = [
  "",
  "draft",
  "scheduled",
  "published",
  "unpublished",
  "archived",
];

export function PostFilters({
  categories,
  tags,
  current,
  totalItems,
  hasActiveFilters,
}: {
  categories: Category[];
  tags: Tag[];
  current: AdminPostsFilterParams & {
    status?: string;
  };
  totalItems: number;
  hasActiveFilters: boolean;
}) {
  const filterParams: AdminPostsFilterParams = {
    status: current.status,
    search: current.search,
    categoryId: current.categoryId,
    tagId: current.tagId,
    sort: current.sort,
    direction: current.direction,
  };

  return (
    <form
      method="get"
      className="mb-4 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-4"
    >
      {current.sort ? <input type="hidden" name="sort" value={current.sort} /> : null}
      {current.direction ? <input type="hidden" name="direction" value={current.direction} /> : null}

      <label className="text-sm">
        <span className="mb-1 block font-medium">Status</span>
        <select
          name="status"
          defaultValue={current.status ?? ""}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          <option value="">All statuses</option>
          {statuses.filter(Boolean).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Category</span>
        <select
          name="categoryId"
          defaultValue={current.categoryId ?? ""}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {current.tagId ? <input type="hidden" name="tagId" value={current.tagId} /> : null}

      <TagFilterCombobox key={current.tagId ?? "all"} tags={tags} current={filterParams} />

      <label className="text-sm md:col-span-4">
        <span className="mb-1 block font-medium">Search</span>
        <input
          type="search"
          name="search"
          defaultValue={current.search ?? ""}
          placeholder="Title, slug, or content"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:col-span-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
          >
            Apply filters
          </button>
          <Link
            href={ADMIN_POSTS_RESET_PATH}
            className="rounded-md border border-[var(--border)] px-4 py-2 text-sm"
          >
            Reset
          </Link>
        </div>
        <p className="text-sm text-[var(--muted)] sm:text-right" aria-live="polite">
          {formatAdminPostsCountLabel(totalItems, hasActiveFilters)}
        </p>
      </div>
    </form>
  );
}
