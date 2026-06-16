import { asc, desc, sql, type SQL } from "drizzle-orm";
import { categories } from "@/modules/categories/categories.schema";
import { posts } from "./posts.schema";
import type { AdminPostListFilters } from "./posts.types";

export type AdminDefaultSortPost = {
  publicOrder: number;
  publishedAt: Date | null;
  updatedAt: Date;
};

export const DEFAULT_ADMIN_POST_ORDER_SQL = [
  "public_order ASC",
  "COALESCE(published_at, updated_at) DESC",
  "updated_at DESC",
] as const;

/**
 * Default admin list order (no explicit column sort selected):
 * 1. publicOrder ASC
 * 2. COALESCE(publishedAt, updatedAt) DESC within the same publicOrder
 * 3. updatedAt DESC as final tiebreaker
 */
export function getAdminPostsDefaultOrderBy(): SQL[] {
  return [
    asc(posts.publicOrder),
    sql`COALESCE(${posts.publishedAt}, ${posts.updatedAt}) DESC`,
    desc(posts.updatedAt),
  ];
}

export const DEFAULT_ADMIN_POST_ORDER = getAdminPostsDefaultOrderBy();

function getDefaultSortDate(post: AdminDefaultSortPost): number {
  return (post.publishedAt ?? post.updatedAt).getTime();
}

/**
 * Pure comparator mirroring getAdminPostsDefaultOrderBy() for unit tests.
 */
export function compareDefaultAdminPostOrder(
  left: AdminDefaultSortPost,
  right: AdminDefaultSortPost
): number {
  const orderDiff = left.publicOrder - right.publicOrder;
  if (orderDiff !== 0) {
    return orderDiff;
  }

  const dateDiff = getDefaultSortDate(right) - getDefaultSortDate(left);
  if (dateDiff !== 0) {
    return dateDiff;
  }

  return right.updatedAt.getTime() - left.updatedAt.getTime();
}

export function sortPostsByDefaultAdminOrder<T extends AdminDefaultSortPost>(items: T[]): T[] {
  return [...items].sort(compareDefaultAdminPostOrder);
}

function buildExplicitPublicOrderBy(direction: "asc" | "desc"): SQL[] {
  return direction === "asc"
    ? getAdminPostsDefaultOrderBy()
    : [desc(posts.publicOrder), sql`COALESCE(${posts.publishedAt}, ${posts.updatedAt}) DESC`, desc(posts.updatedAt)];
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
