import type { Category } from "@/modules/categories/categories.types";
import { PublicEmptyState } from "./public-empty-state";
import { TopicCard, TopicCardGrid, TopicCardItem } from "./topic-card";

export function CategoryList({ categories }: { categories: Category[] }) {
  if (categories.length === 0) {
    return (
      <PublicEmptyState
        title="No categories yet"
        description="Categories will appear here once published posts are assigned."
      />
    );
  }

  return (
    <TopicCardGrid>
      {categories.map((category) => (
        <TopicCardItem key={category.id}>
          <TopicCard
            href={`/categories/${category.slug}`}
            name={category.name}
            description={category.description}
          />
        </TopicCardItem>
      ))}
    </TopicCardGrid>
  );
}
