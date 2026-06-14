import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

const MIME_TO_EXTENSIONS: Record<AllowedImageMimeType, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};

const BLOCKED_EXTENSIONS = [".svg", ".svgz", ".exe", ".php", ".js", ".html", ".htm"];

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

export function getFileExtension(filename: string): string {
  const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function assertAllowedUpload(input: {
  mimeType: string;
  originalFilename: string;
  fileSizeBytes: number;
  maxFileSizeBytes: number;
}): AllowedImageMimeType {
  const extension = getFileExtension(input.originalFilename);

  if (input.mimeType === "image/svg+xml" || extension === ".svg" || extension === ".svgz") {
    throw new Error("SVG uploads are not allowed");
  }

  if (BLOCKED_EXTENSIONS.includes(extension)) {
    throw new Error("File extension is not allowed");
  }

  if (!isAllowedImageMimeType(input.mimeType)) {
    throw new Error("Unsupported image MIME type");
  }

  const allowedExtensions = MIME_TO_EXTENSIONS[input.mimeType];
  if (extension && !allowedExtensions.includes(extension)) {
    throw new Error("File extension does not match MIME type");
  }

  if (input.fileSizeBytes <= 0) {
    throw new Error("Empty files are not allowed");
  }

  if (input.fileSizeBytes > input.maxFileSizeBytes) {
    throw new Error("File exceeds maximum upload size");
  }

  return input.mimeType;
}

export function buildUniqueSafeFilename(originalFilename: string, existingNames: string[]): string {
  const extension = getFileExtension(originalFilename);
  const stem = sanitizeFilename(originalFilename.replace(/\.[^.]+$/, "") || "image");
  let candidate = `${stem}${extension}`;
  let counter = 2;

  while (existingNames.includes(candidate)) {
    candidate = `${stem}-${counter}${extension}`;
    counter += 1;
  }

  return candidate;
}

export function assertSafeStorageKey(storageKey: string): void {
  if (storageKey.includes("..") || storageKey.startsWith("/") || storageKey.includes("\\")) {
    throw new Error("Invalid storage key");
  }
}
