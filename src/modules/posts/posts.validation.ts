import { z } from "zod";
import { isValidSlug, normalizeSlug } from "./slug";

const slugSchema = z
  .string()
  .min(1)
  .transform((value) => normalizeSlug(value))
  .refine((value) => isValidSlug(value), {
    message: "Slug must contain only lowercase letters, numbers, and hyphens",
  });

export const createPostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: slugSchema.optional(),
  excerpt: z.string().max(1000).optional(),
  contentMarkdown: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  slug: slugSchema.optional(),
  excerpt: z.string().max(1000).nullable().optional(),
  contentMarkdown: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  coverAssetId: z.string().uuid().nullable().optional(),
  ogAssetId: z.string().uuid().nullable().optional(),
  seoTitle: z.string().max(300).nullable().optional(),
  seoDescription: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().max(500).nullable().optional(),
  ogTitle: z.string().max(300).nullable().optional(),
  ogDescription: z.string().max(500).nullable().optional(),
  featured: z.boolean().optional(),
  pinned: z.boolean().optional(),
  pinnedPriority: z.number().int().min(0).max(1000).optional(),
  createRevision: z.boolean().optional(),
});

export const publishPostSchema = z.object({
  publishedAt: z.coerce.date().optional(),
});

export const schedulePostSchema = z.object({
  scheduledAt: z.coerce.date(),
});

export const pinPostSchema = z.object({
  pinnedPriority: z.number().int().min(0).max(1000).default(0),
});

export const publicOrderSchema = z.object({
  publicOrder: z.number().int().min(1).max(9999),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PublishPostInput = z.infer<typeof publishPostSchema>;
export type SchedulePostInput = z.infer<typeof schedulePostSchema>;
export type PinPostInput = z.infer<typeof pinPostSchema>;
export type PublicOrderInput = z.infer<typeof publicOrderSchema>;

export function assertPublishablePost(input: {
  title: string;
  slug: string;
  contentMarkdown: string;
}) {
  if (!input.title.trim()) {
    throw new Error("Publishing requires a title");
  }
  if (!isValidSlug(input.slug)) {
    throw new Error("Publishing requires a valid slug");
  }
  if (!input.contentMarkdown.trim()) {
    throw new Error("Publishing requires non-empty Markdown content");
  }
}

export function assertScheduleDate(scheduledAt: Date) {
  if (scheduledAt.getTime() <= Date.now()) {
    throw new Error("Scheduling requires a future scheduledAt date");
  }
}
