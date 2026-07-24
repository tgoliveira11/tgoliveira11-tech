import { PostList } from "@/components/public/post-list";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

export function RelatedArticlesSection({ posts }: { posts: PublicPostBundle[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-articles-heading"
      className="mx-auto mt-14 max-w-5xl border-t border-[var(--border)] pt-10"
    >
      <PublicSectionHeading
        id="related-articles-heading"
        title="Related articles"
        description="More writing connected by category, tags, and publication context."
      />
      <PostList
        posts={posts}
        layout="grid"
        variant="compact"
        maxTags={3}
        showPromotionBadges={false}
      />
    </section>
  );
}
