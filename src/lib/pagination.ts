export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function normalizePage(page: number | string | undefined): number {
  const parsed = typeof page === "string" ? Number(page) : page ?? 1;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export function buildPaginatedResult<T>(
  items: T[],
  options: { page: number; pageSize: number; totalItems: number }
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(options.totalItems / options.pageSize));
  const page = Math.min(Math.max(1, options.page), totalPages);

  return {
    items,
    page,
    pageSize: options.pageSize,
    totalItems: options.totalItems,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}
