import type { Post } from "@/modules/posts/posts.types";
import { asc, desc, sql, type SQL } from "drizzle-orm";
import { posts } from "@/modules/posts/posts.schema";

export type PublicPostOrderable = Pick<Post, "id" | "publicOrder" | "publishedAt" | "updatedAt">;

/**
 * Shared public listing order for `/blog`, home recent lists, tag/category pages,
 * previous/next navigation, and RSS.
 *
 * 1. publicOrder ASC (nulls last, matching PostgreSQL default)
 * 2. COALESCE(publishedAt, updatedAt) DESC
 * 3. updatedAt DESC
 * 4. id ASC (stable tie-breaker)
 */
export function getPublicPostOrderBy(): SQL[] {
  return [
    asc(posts.publicOrder),
    sql`COALESCE(${posts.publishedAt}, ${posts.updatedAt}) DESC`,
    desc(posts.updatedAt),
    asc(posts.id),
  ];
}

/** @deprecated Use {@link getPublicPostOrderBy} */
export const publicPostListingOrder = getPublicPostOrderBy();

function getPublicSortDate(post: PublicPostOrderable): number {
  return (post.publishedAt ?? post.updatedAt).getTime();
}

function comparePublicOrderValue(left: number | null, right: number | null): number {
  const leftOrder = left ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right ?? Number.MAX_SAFE_INTEGER;
  return leftOrder - rightOrder;
}

/** In-memory comparator mirroring {@link getPublicPostOrderBy} for tests. */
export function comparePublicPostOrder(left: PublicPostOrderable, right: PublicPostOrderable): number {
  const orderDiff = comparePublicOrderValue(left.publicOrder, right.publicOrder);
  if (orderDiff !== 0) {
    return orderDiff;
  }

  const dateDiff = getPublicSortDate(right) - getPublicSortDate(left);
  if (dateDiff !== 0) {
    return dateDiff;
  }

  const updatedDiff = right.updatedAt.getTime() - left.updatedAt.getTime();
  if (updatedDiff !== 0) {
    return updatedDiff;
  }

  return left.id.localeCompare(right.id);
}

/** @deprecated Use {@link comparePublicPostOrder} */
export const comparePublicPostListing = comparePublicPostOrder;

export function sortPublicPostOrder<T extends PublicPostOrderable>(items: T[]): T[] {
  return [...items].sort(comparePublicPostOrder);
}

/** @deprecated Use {@link sortPublicPostOrder} */
export const sortPublicPostListing = sortPublicPostOrder;

export function findPublicPostNeighbors<T extends PublicPostOrderable>(
  orderedPosts: T[],
  currentPostId: string
): { previous: T | null; next: T | null } {
  const index = orderedPosts.findIndex((post) => post.id === currentPostId);
  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? orderedPosts[index - 1] : null,
    next: index < orderedPosts.length - 1 ? orderedPosts[index + 1] : null,
  };
}
