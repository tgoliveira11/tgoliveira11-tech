import { publicPostPath } from "@/modules/posts/slug";

/**
 * Root-level legacy post URLs from the old GitHub Pages blog:
 * /YYYY-MM-DD-slug (optional trailing slash).
 */
export const LEGACY_ROOT_POST_PATH_PATTERN = /^\/(\d{4}-\d{2}-\d{2}-[a-z0-9-]+)\/?$/i;

export function parseLegacyRootPostSlug(pathname: string): string | null {
  const match = LEGACY_ROOT_POST_PATH_PATTERN.exec(pathname);
  if (!match) {
    return null;
  }

  return match[1].toLowerCase();
}

export function getLegacyPostRedirectPath(pathname: string): string | null {
  const slug = parseLegacyRootPostSlug(pathname);
  if (!slug) {
    return null;
  }

  return publicPostPath(slug);
}
