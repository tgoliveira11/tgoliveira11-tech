import Link from "next/link";
import type { PostStatus } from "@/modules/posts/posts.types";
import type { Category } from "@/modules/categories/categories.types";
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
}: {
  categories: Category[];
  tags: Tag[];
  current: {
    status?: string;
    search?: string;
    categoryId?: string;
    tagId?: string;
    sort?: string;
    direction?: string;
  };
}) {
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

      <label className="text-sm">
        <span className="mb-1 block font-medium">Tag</span>
        <select
          name="tagId"
          defaultValue={current.tagId ?? ""}
          disabled={tags.length === 0}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          aria-describedby={tags.length === 0 ? "tag-filter-empty" : undefined}
        >
          <option value="">All tags</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
        {tags.length === 0 ? (
          <span id="tag-filter-empty" className="mt-1 block text-xs text-[var(--muted)]">
            No tags yet
          </span>
        ) : null}
      </label>

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

      <div className="flex items-end gap-2 md:col-span-4">
        <button
          type="submit"
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)]"
        >
          Apply filters
        </button>
        <Link href="/admin/posts" className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">
          Reset
        </Link>
      </div>
    </form>
  );
}
