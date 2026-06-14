import type { Post } from "./posts.types";

/** Returns true when a post is eligible for public surfaces. */
export function isPublicPost(post: Post, now = new Date()): boolean {
  return (
    post.status === "published" &&
    post.publishedAt !== null &&
    post.publishedAt.getTime() <= now.getTime()
  );
}
