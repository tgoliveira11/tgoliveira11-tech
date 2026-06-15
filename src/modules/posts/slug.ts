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

export function publicPostPath(slug: string): string {
  return `/blog/${slug}`;
}
