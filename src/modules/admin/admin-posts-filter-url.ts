import type { Tag } from "@/modules/tags/tags.types";

export type AdminPostsFilterParams = {
  status?: string;
  search?: string;
  categoryId?: string;
  tagId?: string;
  sort?: string;
  direction?: string;
};

export const ALL_TAGS_OPTION_ID = "";

export function filterTagsByQuery(tags: Tag[], query: string): Tag[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return tags;
  }

  return tags.filter((tag) => tag.name.toLowerCase().includes(normalized));
}

export function buildAdminPostsFilterUrl(
  current: AdminPostsFilterParams,
  updates: { tagId?: string | null } = {}
): string {
  const params = new URLSearchParams();

  if (current.status) {
    params.set("status", current.status);
  }
  if (current.categoryId) {
    params.set("categoryId", current.categoryId);
  }
  if (current.search) {
    params.set("search", current.search);
  }
  if (current.sort) {
    params.set("sort", current.sort);
  }
  if (current.direction) {
    params.set("direction", current.direction);
  }

  const nextTagId =
    updates.tagId === null ? undefined : updates.tagId !== undefined ? updates.tagId : current.tagId;

  if (nextTagId) {
    params.set("tagId", nextTagId);
  }

  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export function getTagFilterOptions(tags: Tag[], query: string, showAllTags: boolean): Tag[] {
  if (showAllTags || !query.trim()) {
    return [...tags].sort((left, right) => left.name.localeCompare(right.name));
  }

  return filterTagsByQuery(tags, query);
}
