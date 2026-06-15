import type { Tag } from "@/modules/tags/tags.types";
import { PublicEmptyState } from "./public-empty-state";
import { TopicPill, TopicPillGrid, TopicPillItem } from "./topic-pill";

export function TagList({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) {
    return (
      <PublicEmptyState
        title="No tags yet"
        description="Tags will appear here once published posts are tagged."
      />
    );
  }

  return (
    <TopicPillGrid>
      {tags.map((tag) => (
        <TopicPillItem key={tag.id}>
          <TopicPill href={`/tags/${tag.slug}`} name={tag.name} />
        </TopicPillItem>
      ))}
    </TopicPillGrid>
  );
}
