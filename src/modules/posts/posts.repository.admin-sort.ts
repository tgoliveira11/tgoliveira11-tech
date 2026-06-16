import { asc, desc, sql, type SQL } from "drizzle-orm";
import { categories } from "@/modules/categories/categories.schema";
import { posts } from "./posts.schema";
import type { AdminPostListFilters } from "./posts.types";

export type AdminDefaultSortPost = {
  publicOrder: number | null;
  publishedAt: Date | null;
  updatedAt: Date;
};

export const DEFAULT_ADMIN_POST_ORDER_SQL = [
  "CASE WHEN public_order IS NULL THEN 0 ELSE 1 END ASC",
  "CASE WHEN public_order IS NULL THEN published_at END DESC NULLS LAST",
  "CASE WHEN public_order IS NULL THEN updated_at END DESC",
  "CASE WHEN public_order IS NOT NULL THEN public_order ELSE NULL END ASC NULLS LAST",
  "updated_at DESC",
] as const;

/**
 * Default admin list order (no explicit column sort selected):
 * 1. publicOrder IS NULL first
 * 2. among nulls: publishedAt DESC NULLS LAST, then updatedAt DESC
 * 3. among non-nulls: publicOrder ASC
 * 4. updatedAt DESC as final tiebreaker
 */
export function getAdminPostsDefaultOrderBy(): SQL[] {
  return [
    sql`CASE WHEN ${posts.publicOrder} IS NULL THEN 0 ELSE 1 END ASC`,
    sql`CASE WHEN ${posts.publicOrder} IS NULL THEN ${posts.publishedAt} END DESC NULLS LAST`,
    sql`CASE WHEN ${posts.publicOrder} IS NULL THEN ${posts.updatedAt} END DESC`,
    sql`CASE WHEN ${posts.publicOrder} IS NOT NULL THEN ${posts.publicOrder} ELSE NULL END ASC NULLS LAST`,
    desc(posts.updatedAt),
  ];
}

export const DEFAULT_ADMIN_POST_ORDER = getAdminPostsDefaultOrderBy();

/**
 * Pure comparator mirroring getAdminPostsDefaultOrderBy() for unit tests.
 */
export function compareDefaultAdminPostOrder(
  left: AdminDefaultSortPost,
  right: AdminDefaultSortPost
): number {
  const leftGroup = left.publicOrder === null ? 0 : 1;
  const rightGroup = right.publicOrder === null ? 0 : 1;
  if (leftGroup !== rightGroup) {
    return leftGroup - rightGroup;
  }

  if (leftGroup === 0) {
    const leftPublished = left.publishedAt?.getTime() ?? null;
    const rightPublished = right.publishedAt?.getTime() ?? null;

    if (leftPublished !== null || rightPublished !== null) {
      if (leftPublished === null) {
        return 1;
      }
      if (rightPublished === null) {
        return -1;
      }
      if (leftPublished !== rightPublished) {
        return rightPublished - leftPublished;
      }
    }

    const updatedDiff = right.updatedAt.getTime() - left.updatedAt.getTime();
    if (updatedDiff !== 0) {
      return updatedDiff;
    }

    return 0;
  }

  const orderDiff = (left.publicOrder ?? 0) - (right.publicOrder ?? 0);
  if (orderDiff !== 0) {
    return orderDiff;
  }

  return right.updatedAt.getTime() - left.updatedAt.getTime();
}

export function sortPostsByDefaultAdminOrder<T extends AdminDefaultSortPost>(items: T[]): T[] {
  return [...items].sort(compareDefaultAdminPostOrder);
}

function buildExplicitPublicOrderBy(direction: "asc" | "desc"): SQL[] {
  return [
    sql`CASE WHEN ${posts.publicOrder} IS NULL THEN 0 ELSE 1 END ASC`,
    direction === "asc" ? asc(posts.publicOrder) : desc(posts.publicOrder),
    desc(posts.updatedAt),
  ];
}

/**
 * Flags sort: pinned first, then featured, then pinned priority, then recency.
 * Ascending reverses each tier.
 */
export function buildFlagsOrderBy(direction: "asc" | "desc"): SQL[] {
  if (direction === "asc") {
    return [
      asc(posts.pinned),
      asc(posts.featured),
      asc(posts.pinnedPriority),
      asc(posts.updatedAt),
    ];
  }

  return [
    desc(posts.pinned),
    desc(posts.featured),
    desc(posts.pinnedPriority),
    desc(posts.updatedAt),
  ];
}

export function buildAdminPostOrderBy(filters: AdminPostListFilters): SQL[] {
  if (!filters.sort) {
    return getAdminPostsDefaultOrderBy();
  }

  const direction = filters.direction ?? "asc";

  switch (filters.sort) {
    case "title":
      return direction === "asc"
        ? [asc(posts.title), desc(posts.updatedAt)]
        : [desc(posts.title), desc(posts.updatedAt)];
    case "status":
      return direction === "asc"
        ? [asc(posts.status), desc(posts.updatedAt)]
        : [desc(posts.status), desc(posts.updatedAt)];
    case "published":
      return direction === "asc"
        ? [sql`${posts.publishedAt} ASC NULLS LAST`, desc(posts.updatedAt)]
        : [sql`${posts.publishedAt} DESC NULLS LAST`, desc(posts.updatedAt)];
    case "scheduled":
      return direction === "asc"
        ? [sql`${posts.scheduledAt} ASC NULLS LAST`, desc(posts.updatedAt)]
        : [sql`${posts.scheduledAt} DESC NULLS LAST`, desc(posts.updatedAt)];
    case "updated":
      return direction === "asc" ? [asc(posts.updatedAt)] : [desc(posts.updatedAt)];
    case "publicOrder":
      return buildExplicitPublicOrderBy(direction);
    case "flags":
      return buildFlagsOrderBy(direction);
    case "category":
      return direction === "asc"
        ? [asc(categories.name), desc(posts.updatedAt)]
        : [desc(categories.name), desc(posts.updatedAt)];
    default:
      return getAdminPostsDefaultOrderBy();
  }
}

export function adminListRequiresCategoryJoin(filters: AdminPostListFilters): boolean {
  return filters.sort === "category";
}
