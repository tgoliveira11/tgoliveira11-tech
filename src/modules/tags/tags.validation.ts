import { z } from "zod";
import { isValidSlug, normalizeSlug } from "@/modules/posts/slug";

const slugSchema = z
  .string()
  .min(1)
  .transform((value) => normalizeSlug(value))
  .refine((value) => isValidSlug(value), { message: "Invalid tag slug" });

export const createTagSchema = z.object({
  name: z.string().min(1).max(120),
  slug: slugSchema.optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: slugSchema.optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
