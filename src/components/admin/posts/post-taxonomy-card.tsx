import type { Category } from "@/modules/categories/categories.types";
import type { Tag } from "@/modules/tags/tags.types";
import { EditorCard } from "./editor-card";

export function PostTaxonomyCard({
  formId,
  categories,
  tags,
  categoryId,
  tagIds,
}: {
  formId: string;
  categories: Category[];
  tags: Tag[];
  categoryId: string | null;
  tagIds: string[];
}) {
  return (
    <EditorCard title="Taxonomy" description="Category and tags for filtering and organization.">
      <label className="block text-sm">
        <span className="mb-1 block font-medium">Category</span>
        <select
          name="categoryId"
          form={formId}
          defaultValue={categoryId ?? ""}
          className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="mt-3 text-sm">
        <legend className="mb-1 font-medium">Tags</legend>
        {tags.length === 0 ? (
          <p className="rounded-md border border-dashed border-[var(--border)] px-3 py-4 text-xs text-[var(--muted)]">
            No tags exist yet. Tag management is deferred — create tags via the database or a future
            admin screen.
          </p>
        ) : (
          <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border border-[var(--border)] p-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="tagIds"
                  form={formId}
                  value={tag.id}
                  defaultChecked={tagIds.includes(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </EditorCard>
  );
}
