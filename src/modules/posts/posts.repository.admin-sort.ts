import { asc, desc, sql, type SQL } from "drizzle-orm";
import { categories } from "@/modules/categories/categories.schema";
import { posts } from "./posts.schema";
import type { AdminPostListFilters } from "./posts.types";

/**
 * Default admin list order:
 * 1. publicOrder IS NULL first (unordered posts needing attention)
 * 2. among nulls: publishedAt DESC, then updatedAt DESC
 * 3. then publicOrder IS NOT NULL, sorted by publicOrder ASC
 */
export const DEFAULT_ADMIN_POST_ORDER: SQL[] = [
  sql`${posts.publicOrder} IS NOT NULL`,
  sql`CASE WHEN ${posts.publicOrder} IS NULL THEN ${posts.publishedAt} END DESC NULLS LAST`,
  sql`CASE WHEN ${posts.publicOrder} IS NULL THEN ${posts.updatedAt} END DESC`,
  sql`${posts.publicOrder} ASC NULLS LAST`,
];

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
    return DEFAULT_ADMIN_POST_ORDER;
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
      return direction === "asc"
        ? [sql`${posts.publicOrder} IS NULL`, asc(posts.publicOrder), desc(posts.publishedAt)]
        : [sql`${posts.publicOrder} IS NULL`, desc(posts.publicOrder), desc(posts.publishedAt)];
    case "flags":
      return buildFlagsOrderBy(direction);
    case "category":
      return direction === "asc"
        ? [asc(categories.name), desc(posts.updatedAt)]
        : [desc(categories.name), desc(posts.updatedAt)];
    default:
      return DEFAULT_ADMIN_POST_ORDER;
  }
}

export function adminListRequiresCategoryJoin(filters: AdminPostListFilters): boolean {
  return filters.sort === "category";
}
