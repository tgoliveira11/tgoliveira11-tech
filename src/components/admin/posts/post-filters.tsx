import Link from "next/link";
import type { PostStatus } from "@/modules/posts/posts.types";
import type { Category } from "@/modules/categories/categories.types";

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
  current,
}: {
  categories: Category[];
  current: {
    status?: string;
    search?: string;
    categoryId?: string;
    sort?: string;
  };
}) {
  return (
    <form method="get" className="mb-4 grid gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-4">
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

      <label className="text-sm md:col-span-2">
        <span className="mb-1 block font-medium">Search</span>
        <input
          type="search"
          name="search"
          defaultValue={current.search ?? ""}
          placeholder="Title, slug, or content"
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Sort</span>
        <select
          name="sort"
          defaultValue={current.sort ?? "updatedAt"}
          className="w-full rounded-md border border-[var(--border)] px-3 py-2"
        >
          <option value="updatedAt">Recently updated</option>
          <option value="publishedAt">Recently published</option>
        </select>
      </label>

      <div className="flex items-end gap-2 md:col-span-3">
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
