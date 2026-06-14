import fs from "node:fs/promises";
import path from "node:path";
import { users } from "@tgoliveira/secure-auth/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/get-db";
import { readAdminEmail } from "@/lib/env";
import { ConflictError } from "@/lib/errors";
import * as assetsService from "@/modules/assets/assets.service";
import * as categoriesRepo from "@/modules/categories/categories.repository";
import * as categoriesService from "@/modules/categories/categories.service";
import { publicPostPath, slugFromTitle } from "@/modules/posts/slug";
import * as postsRepo from "@/modules/posts/posts.repository";
import * as postsService from "@/modules/posts/posts.service";
import * as redirectsRepo from "@/modules/redirects/redirects.repository";
import * as redirectsService from "@/modules/redirects/redirects.service";
import * as tagsRepo from "@/modules/tags/tags.repository";
import * as tagsService from "@/modules/tags/tags.service";
import type { ImportWriter } from "./github-pages.types";

export async function resolveImportUserId(authorEmail?: string): Promise<string> {
  const email = (authorEmail ?? readAdminEmail())?.toLowerCase();
  if (!email) {
    throw new Error("ADMIN_EMAIL or --author-email is required for import mode.");
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    throw new Error(`No user found for email: ${email}`);
  }

  return user.id;
}

export function createDatabaseImportWriter(userId: string): ImportWriter {
  return {
    async slugExists(slug) {
      return postsRepo.slugExists(slug);
    },

    async findOrCreateTag(name) {
      const slug = slugFromTitle(name);
      const existing = await tagsRepo.findTagBySlug(slug);
      if (existing) {
        return { id: existing.id, created: false };
      }

      try {
        const created = await tagsService.createTag({ name, slug });
        return { id: created.id, created: true };
      } catch (error) {
        if (error instanceof ConflictError) {
          const fallback = await tagsRepo.findTagBySlug(slug);
          if (fallback) {
            return { id: fallback.id, created: false };
          }
        }
        throw error;
      }
    },

    async findOrCreateCategory(name) {
      const slug = slugFromTitle(name);
      const existing = await categoriesRepo.findCategoryBySlug(slug);
      if (existing) {
        return { id: existing.id, created: false };
      }

      try {
        const created = await categoriesService.createCategory({ name, slug });
        return { id: created.id, created: true };
      } catch (error) {
        if (error instanceof ConflictError) {
          const fallback = await categoriesRepo.findCategoryBySlug(slug);
          if (fallback) {
            return { id: fallback.id, created: false };
          }
        }
        throw error;
      }
    },

    async redirectExists(sourcePath) {
      const redirect = await redirectsRepo.findRedirectBySourcePath(sourcePath);
      return !!redirect;
    },

    async createDraft(input) {
      const post = await postsService.createDraft(
        {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt ?? undefined,
          contentMarkdown: input.contentMarkdown,
          categoryId: input.categoryId ?? null,
          tagIds: input.tagIds,
        },
        userId
      );
      return { id: post.id, slug: post.slug };
    },

    async updateDraft(postId, input) {
      const post = await postsService.updateDraft(postId, input, userId);
      return { id: post.id, slug: post.slug };
    },

    async publishPost(postId, publishedAt) {
      await postsService.publishPost(postId, userId, publishedAt ? { publishedAt } : {});
    },

    async uploadLocalImage(input) {
      const buffer = await fs.readFile(input.absolutePath);
      const originalFilename = path.basename(input.absolutePath);
      const mimeType = assetsService.guessMimeTypeFromStorageKey(originalFilename);
      const asset = await assetsService.uploadPostAsset({
        postId: input.postId,
        buffer,
        originalFilename,
        mimeType,
        altText: input.altText ?? null,
        userId,
      });
      return { publicUrl: asset.publicUrl, assetId: asset.id };
    },

    async createRedirect(sourcePath, targetPath) {
      await redirectsService.createRedirect({
        sourcePath,
        targetPath,
        statusCode: 301,
      });
    },

    async resolveUserId(email) {
      return resolveImportUserId(email);
    },
  };
}

export function mapTargetPath(slug: string, baseNewPath: string): string {
  const normalizedBase = baseNewPath.endsWith("/") ? baseNewPath.slice(0, -1) : baseNewPath;
  if (normalizedBase === "/blog") {
    return publicPostPath(slug);
  }
  return `${normalizedBase}/${slug}`.replace(/\/{2,}/g, "/");
}

export function normalizeLegacyPath(pathValue: string, baseOldPath: string): string {
  let normalized = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  if (baseOldPath !== "/" && normalized.startsWith(baseOldPath)) {
    normalized = normalized.slice(baseOldPath.length) || "/";
    if (!normalized.startsWith("/")) {
      normalized = `/${normalized}`;
    }
  }
  return normalized.replace(/\/+$/, "") || "/";
}
