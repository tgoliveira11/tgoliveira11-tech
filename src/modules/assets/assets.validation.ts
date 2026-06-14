import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const createAssetMetadataSchema = z.object({
  postId: z.string().uuid(),
  storageProvider: z.string().min(1),
  storageKey: z.string().min(1),
  publicUrl: z.string().min(1),
  originalFilename: z.string().min(1),
  safeFilename: z.string().min(1),
  mimeType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  fileSizeBytes: z.number().int().positive(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
  hash: z.string().max(128).nullable().optional(),
});

export const updateAssetMetadataSchema = z.object({
  altText: z.string().max(500).nullable().optional(),
  caption: z.string().max(1000).nullable().optional(),
});

export type CreateAssetMetadataValidated = z.infer<typeof createAssetMetadataSchema>;
export type UpdateAssetMetadataValidated = z.infer<typeof updateAssetMetadataSchema>;

export function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.slice(0, 200) || "file";
}

export function assertSafeStorageKey(storageKey: string): void {
  if (storageKey.includes("..") || storageKey.startsWith("/") || storageKey.includes("\\")) {
    throw new Error("Invalid storage key");
  }
}
