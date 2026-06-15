export const PUBLIC_SEARCH_PATH = "/search";

export function normalizeSearchQuery(query: string | undefined | null): string {
  return (query ?? "").trim();
}

export function hasSearchQuery(query: string | undefined | null): boolean {
  return normalizeSearchQuery(query).length > 0;
}

export function formatSearchResultLabel(count: number, query: string): string {
  const noun = count === 1 ? "result" : "results";
  return `${count} ${noun} for "${query}"`;
}

export function buildPublicSearchPath(query: string, basePath = PUBLIC_SEARCH_PATH): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return basePath;
  }

  const params = new URLSearchParams({ q: trimmed });
  return `${basePath}?${params.toString()}`;
}
