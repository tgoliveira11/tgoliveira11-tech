const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function slugFromTitle(title: string): string {
  const slug = normalizeSlug(title);
  return slug.length > 0 ? slug : "post";
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

const DATED_SLUG_MAX_LENGTH = 120;

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function formatSlugDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateDatedSlugFromTitle(title: string, date = new Date()): string {
  const normalizedTitle = stripDiacritics(title);
  const titleSlug = normalizeSlug(normalizedTitle) || "post";
  const prefix = formatSlugDate(date);
  const maxTitleLength = Math.max(1, DATED_SLUG_MAX_LENGTH - prefix.length - 1);
  const trimmedTitleSlug =
    titleSlug.length > maxTitleLength ? titleSlug.slice(0, maxTitleLength).replace(/-+$/g, "") : titleSlug;
  const candidate = `${prefix}-${trimmedTitleSlug}`.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return candidate || `${prefix}-post`;
}

export function publicPostPath(slug: string): string {
  return `/blog/${slug}`;
}
