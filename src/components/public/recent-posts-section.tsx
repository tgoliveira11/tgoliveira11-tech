import { PostList } from "@/components/public/post-list";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

export function RecentPostsSection({ posts }: { posts: PublicPostBundle[] }) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recent-posts-heading">
      <PublicSectionHeading
        id="recent-posts-heading"
        title="Recent posts"
        description="More articles from the archive."
        action={{ href: "/blog", label: "View all posts" }}
      />
      <PostList posts={posts} layout="grid" variant="compact" />
    </section>
  );
}
