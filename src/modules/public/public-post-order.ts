import type { Post } from "@/modules/posts/posts.types";
import { asc, desc, sql } from "drizzle-orm";
import { posts } from "@/modules/posts/posts.schema";

/**
 * Manual public listing order:
 * 1. Posts with publicOrder set (lower numbers first)
 * 2. Posts without publicOrder (publishedAt DESC)
 *
 * Used on home recent lists, /blog, tag, and category pages.
 * Not used for RSS (publishedAt DESC) or search (relevance / publishedAt).
 */
export const publicPostListingOrder = [
  sql`${posts.publicOrder} IS NULL`,
  asc(posts.publicOrder),
  desc(posts.publishedAt),
] as const;

/** In-memory comparator mirroring {@link publicPostListingOrder} for tests. */
export function comparePublicPostListing(a: Post, b: Post): number {
  const aHasOrder = a.publicOrder != null;
  const bHasOrder = b.publicOrder != null;
  if (aHasOrder !== bHasOrder) {
    return aHasOrder ? -1 : 1;
  }
  if (aHasOrder && bHasOrder && a.publicOrder !== b.publicOrder) {
    return a.publicOrder! - b.publicOrder!;
  }
  const aTime = a.publishedAt?.getTime() ?? 0;
  const bTime = b.publishedAt?.getTime() ?? 0;
  return bTime - aTime;
}

export function sortPublicPostListing<T extends { post: Post }>(bundles: T[]): T[] {
  return [...bundles].sort((left, right) => comparePublicPostListing(left.post, right.post));
}
