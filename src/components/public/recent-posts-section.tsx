import { PostList } from "@/components/public/post-list";
import { PublicSectionHeading } from "@/components/public/public-section-heading";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

export function RecentPostsSection({
  posts,
  heading,
}: {
  posts: PublicPostBundle[];
  heading?: string;
}) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recent-posts-heading">
      <PublicSectionHeading
        id="recent-posts-heading"
        title={heading ?? "Recent posts"}
        description={heading ? undefined : "More articles from the archive."}
        action={heading ? undefined : { href: "/blog", label: "View all posts" }}
      />
      <PostList posts={posts} layout="grid" variant="compact" />
    </section>
  );
}
