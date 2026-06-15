import type { Category } from "@/modules/categories/categories.types";
import type { Tag } from "@/modules/tags/tags.types";
import { EditorCard } from "@/components/admin/posts/editor-card";
import { CategoryCombobox } from "./category-combobox";
import { TagCombobox } from "./tag-combobox";

export function TaxonomyCard({
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
    <EditorCard
      title="Taxonomy"
      description="Organize this post with one category and multiple tags."
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1 block text-sm font-medium">Category</span>
          <CategoryCombobox formId={formId} categories={categories} categoryId={categoryId} />
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Tags</span>
          <TagCombobox formId={formId} allTags={tags} selectedTagIds={tagIds} />
        </div>
      </div>
    </EditorCard>
  );
}
