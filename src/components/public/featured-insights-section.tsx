import { FeaturedPostCard } from "@/components/public/featured-post-card";
import { PostList } from "@/components/public/post-list";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

export function FeaturedInsightsSection({ posts }: { posts: PublicPostBundle[] }) {
  if (posts.length === 0) {
    return null;
  }

  const [primary, ...secondary] = posts;

  return (
    <section id="featured-insights" aria-labelledby="featured-insights-heading" className="scroll-mt-24">
      <PublicSectionHeading
        id="featured-insights-heading"
        title="Featured insights"
        description="Selected writing on AI platforms, architecture, product engineering, leadership, and career reinvention."
        action={{ href: "/blog", label: "View all articles" }}
      />
      <div className="space-y-5">
        <FeaturedPostCard bundle={primary} label="Featured insight" />
        {secondary.length > 0 ? (
          <PostList
            posts={secondary}
            layout="grid"
            variant="compact"
            maxTags={3}
            showPromotionBadges={false}
          />
        ) : null}
      </div>
    </section>
  );
}
