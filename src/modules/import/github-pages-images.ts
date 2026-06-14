import fs from "node:fs/promises";
import path from "node:path";
import {
  assertWithinAllowedRoots,
  isRemoteUrl,
  isSafeRelativeImagePath,
  resolveSafePath,
} from "./github-pages.validation";
import type { MarkdownImageReference } from "./github-pages.types";

const MARKDOWN_IMAGE_PATTERN = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export function extractMarkdownImageReferences(markdown: string): MarkdownImageReference[] {
  const references: MarkdownImageReference[] = [];
  for (const match of markdown.matchAll(MARKDOWN_IMAGE_PATTERN)) {
    const fullMatch = match[0];
    const alt = match[1] ?? "";
    const url = match[2] ?? "";
    references.push({
      fullMatch,
      alt,
      url,
      isRemote: isRemoteUrl(url),
    });
  }
  return references;
}

export function resolveLocalImagePath(input: {
  markdownFilePath: string;
  imageRef: string;
  sourceRoot: string;
  assetsRoot?: string;
}): string | null {
  const ref = input.imageRef.trim();
  if (!isSafeRelativeImagePath(ref)) {
    return null;
  }

  const searchRoots = [
    path.dirname(input.markdownFilePath),
    input.assetsRoot ? path.resolve(input.assetsRoot) : null,
    path.resolve(input.sourceRoot),
  ].filter(Boolean) as string[];

  for (const root of searchRoots) {
    const candidate = ref.startsWith("/")
      ? path.join(path.resolve(input.sourceRoot), ref.replace(/^\//, ""))
      : path.resolve(root, ref);

    try {
      assertWithinAllowedRoots(candidate, input.sourceRoot, input.assetsRoot);
    } catch {
      continue;
    }

    return candidate;
  }

  try {
    const candidate = ref.startsWith("/")
      ? resolveSafePath(input.sourceRoot, ref.replace(/^\//, ""))
      : resolveSafePath(path.dirname(input.markdownFilePath), ref);
    assertWithinAllowedRoots(candidate, input.sourceRoot, input.assetsRoot);
    return candidate;
  } catch {
    return null;
  }
}

export async function localImageExists(absolutePath: string | null): Promise<boolean> {
  if (!absolutePath) return false;
  try {
    const stat = await fs.stat(absolutePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export function rewriteMarkdownImageReference(
  markdown: string,
  originalRef: string,
  nextUrl: string
): string {
  const escaped = originalRef.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(!\\[[^\\]]*\\]\\()${escaped}(\\))`, "g");
  return markdown.replace(pattern, `$1${nextUrl}$2`);
}

export function rewriteMarkdownImages(
  markdown: string,
  replacements: Map<string, string>
): string {
  let next = markdown;
  for (const [originalRef, publicUrl] of replacements) {
    next = rewriteMarkdownImageReference(next, originalRef, publicUrl);
  }
  return next;
}

export function resolveCoverImagePath(input: {
  coverImageRef: string;
  markdownFilePath: string;
  sourceRoot: string;
  assetsRoot?: string;
}): string | null {
  if (isRemoteUrl(input.coverImageRef)) {
    return null;
  }
  return resolveLocalImagePath({
    markdownFilePath: input.markdownFilePath,
    imageRef: input.coverImageRef,
    sourceRoot: input.sourceRoot,
    assetsRoot: input.assetsRoot,
  });
}
