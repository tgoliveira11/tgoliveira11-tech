import { z } from "zod";
import { isValidSlug, normalizeSlug } from "@/modules/posts/slug";

const slugSchema = z
  .string()
  .min(1)
  .transform((value) => normalizeSlug(value))
  .refine((value) => isValidSlug(value), { message: "Invalid category slug" });

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
  description: z.string().max(1000).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(1000).nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
