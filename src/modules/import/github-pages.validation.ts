import path from "node:path";
import { normalizeUrlPath } from "@/lib/paths";

export { normalizeUrlPath };

export function resolveSafePath(root: string, candidate: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(resolvedRoot, candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Path escapes source root: ${candidate}`);
  }

  return resolvedCandidate;
}

export function isWithinRoot(root: string, targetPath: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(targetPath);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function assertWithinAllowedRoots(
  targetPath: string,
  sourceRoot: string,
  assetsRoot?: string
): void {
  if (isWithinRoot(sourceRoot, targetPath)) {
    return;
  }
  if (assetsRoot && isWithinRoot(assetsRoot, targetPath)) {
    return;
  }
  throw new Error(`Path escapes allowed import roots: ${targetPath}`);
}

export function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function isSafeRelativeImagePath(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || isRemoteUrl(trimmed) || trimmed.startsWith("data:")) {
    return false;
  }
  if (trimmed.includes("\0")) {
    return false;
  }
  if (path.isAbsolute(trimmed) && !trimmed.startsWith("/")) {
    return false;
  }
  const segments = trimmed.replace(/\\/g, "/").split("/");
  return !segments.some((segment) => segment === "..");
}

export function normalizeTagOrCategoryName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeTagOrCategoryList(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  const rawItems = Array.isArray(value) ? value : [value];
  const names = rawItems
    .flatMap((item) => String(item).split(/[,;|]/))
    .map(normalizeTagOrCategoryName)
    .filter(Boolean);

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(name);
  }

  return unique;
}

export const KNOWN_FRONTMATTER_FIELDS = new Set([
  "title",
  "description",
  "excerpt",
  "date",
  "published",
  "draft",
  "tags",
  "categories",
  "category",
  "slug",
  "permalink",
  "layout",
  "image",
  "cover",
  "coverimage",
  "coverImage",
  "author",
  "ogimage",
  "ogImage",
]);
