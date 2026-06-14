import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { PostCard } from "./post-card";

export function PostList({
  posts,
  emptyMessage = "No published posts yet.",
}: {
  posts: PublicPostBundle[];
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return <p className="text-[var(--muted)]">{emptyMessage}</p>;
  }

  return (
    <ul className="grid gap-6">
      {posts.map((bundle) => (
        <li key={bundle.post.id}>
          <PostCard bundle={bundle} />
        </li>
      ))}
    </ul>
  );
}
