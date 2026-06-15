import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { PublicEmptyState } from "./public-empty-state";
import { PostCard } from "./post-card";

export function PostList({
  posts,
  emptyMessage = "No published posts yet.",
  layout = "stack",
  variant = "default",
}: {
  posts: PublicPostBundle[];
  emptyMessage?: string;
  layout?: "stack" | "grid";
  variant?: "default" | "compact";
}) {
  if (posts.length === 0) {
    return (
      <PublicEmptyState
        title="No posts published yet"
        description={emptyMessage || "Published posts will appear here once they are available."}
      />
    );
  }

  const listClassName = layout === "grid" ? "grid gap-6 sm:grid-cols-2" : "grid gap-6";

  return (
    <ul className={listClassName}>
      {posts.map((bundle) => (
        <li key={bundle.post.id} className="h-full">
          <PostCard bundle={bundle} variant={variant} showPromotionBadges={variant === "default"} />
        </li>
      ))}
    </ul>
  );
}
