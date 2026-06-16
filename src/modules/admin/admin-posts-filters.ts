import type { AdminPostsFilterParams } from "@/modules/admin/admin-posts-filter-url";
import type { AdminPostListFilters, PostStatus } from "@/modules/posts/posts.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const POST_STATUSES: PostStatus[] = [
  "draft",
  "scheduled",
  "published",
  "unpublished",
  "archived",
];

export const ADMIN_POSTS_RESET_PATH = "/admin/posts";

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function parseAdminPostStatus(value: string | undefined): PostStatus | undefined {
  if (!value) {
    return undefined;
  }

  return POST_STATUSES.includes(value as PostStatus) ? (value as PostStatus) : undefined;
}

export function parseAdminTagId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !isValidUuid(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function parseAdminCategoryId(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !isValidUuid(trimmed)) {
    return undefined;
  }

  return trimmed;
}

export function hasActiveAdminPostFilters(filters: AdminPostsFilterParams): boolean {
  return Boolean(
    filters.status?.trim() ||
      filters.categoryId?.trim() ||
      filters.tagId?.trim() ||
      filters.search?.trim()
  );
}

export function formatAdminPostsCountLabel(total: number, hasFilters: boolean): string {
  if (hasFilters) {
    return total === 1 ? "1 post found" : `${total} posts found`;
  }

  return total === 1 ? "1 total post" : `${total} total posts`;
}

export function buildAdminPostsListFilters(input: {
  status?: string;
  search?: string;
  categoryId?: string;
  tagId?: string;
  sort?: AdminPostListFilters["sort"];
  direction?: AdminPostListFilters["direction"];
  limit?: number;
  offset?: number;
}): AdminPostListFilters {
  const filters: AdminPostListFilters = {
    search: input.search?.trim() || undefined,
    status: parseAdminPostStatus(input.status),
    categoryId: parseAdminCategoryId(input.categoryId),
    tagId: parseAdminTagId(input.tagId),
    sort: input.sort,
    direction: input.direction,
    limit: input.limit,
    offset: input.offset,
  };

  return filters;
}
