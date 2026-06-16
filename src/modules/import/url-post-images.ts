import { readUploadMaxFileSizeBytes } from "@/lib/env";
import { ValidationError } from "@/lib/errors";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  getFileExtension,
  isAllowedImageMimeType,
} from "@/modules/assets/assets.validation";
import { uploadPostAsset } from "@/modules/assets/assets.service";
import { safeFetchBinary } from "./url-fetch";

const MIME_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

export type DownloadedMainImage = {
  assetId: string;
  publicUrl: string;
  sourceUrl: string;
};

export async function downloadAndUploadMainImage(input: {
  imageUrl: string;
  postId: string;
  title: string;
  userId: string;
  fetchImpl?: typeof fetch;
}): Promise<DownloadedMainImage> {
  const maxBytes = readUploadMaxFileSizeBytes();
  const fetched = await safeFetchBinary({
    url: input.imageUrl,
    fetchImpl: input.fetchImpl,
    maxBytes,
    allowedContentTypes: /^image\//i,
  });

  const mimeType = normalizeImageMimeType(fetched.contentType);
  if (!isAllowedImageMimeType(mimeType)) {
    throw new ValidationError("Main image type is not supported");
  }

  if (fetched.body.length > maxBytes) {
    throw new ValidationError("Main image exceeds maximum upload size");
  }

  const extension = extensionFromUrl(input.imageUrl) ?? MIME_EXTENSION[mimeType] ?? ".jpg";
  const originalFilename = `imported-cover${extension}`;

  const asset = await uploadPostAsset({
    postId: input.postId,
    buffer: fetched.body,
    originalFilename,
    mimeType,
    altText: input.title,
    caption: input.title,
    userId: input.userId,
  });

  return {
    assetId: asset.id,
    publicUrl: asset.publicUrl,
    sourceUrl: input.imageUrl,
  };
}

function normalizeImageMimeType(contentType: string): string {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(base)) {
    return base;
  }
  throw new ValidationError("Main image type is not supported");
}

function extensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const ext = getFileExtension(pathname);
    return ext || null;
  } catch {
    return null;
  }
}
