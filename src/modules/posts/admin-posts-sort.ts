import type { AdminPostListFilters, AdminPostSortDirection, AdminPostSortField } from "./posts.types";

const SORT_FIELDS: AdminPostSortField[] = [
  "title",
  "status",
  "published",
  "scheduled",
  "updated",
  "flags",
  "publicOrder",
  "category",
];

export function isAdminPostSortField(value: string): value is AdminPostSortField {
  return SORT_FIELDS.includes(value as AdminPostSortField);
}

export function parseAdminPostsSortInput(input: {
  sort?: string;
  direction?: string;
}): Pick<AdminPostListFilters, "sort" | "direction"> & { usesDefaultSort: boolean } {
  if (!input.sort || !isAdminPostSortField(input.sort)) {
    return { usesDefaultSort: true };
  }

  const direction: AdminPostSortDirection = input.direction === "desc" ? "desc" : "asc";
  return {
    sort: input.sort,
    direction,
    usesDefaultSort: false,
  };
}

export function buildAdminPostsSortHref(input: {
  column: AdminPostSortField;
  currentSort?: AdminPostSortField;
  currentDirection?: AdminPostSortDirection;
  filters: Record<string, string | undefined>;
}): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input.filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const nextDirection =
    input.currentSort === input.column && input.currentDirection === "asc" ? "desc" : "asc";

  params.set("sort", input.column);
  params.set("direction", nextDirection);

  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

export function adminSortIndicator(input: {
  column: AdminPostSortField;
  currentSort?: AdminPostSortField;
  currentDirection?: AdminPostSortDirection;
  usesDefaultSort: boolean;
}): "asc" | "desc" | "default" | null {
  if (input.usesDefaultSort && input.column === "publicOrder") {
    return "default";
  }

  if (input.currentSort !== input.column) {
    return null;
  }

  return input.currentDirection ?? "asc";
}
