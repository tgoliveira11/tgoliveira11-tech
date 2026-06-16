import { createHash } from "node:crypto";
import { readUploadMaxFileSizeBytes } from "@/lib/env";
import { NotFoundError, ValidationError } from "@/lib/errors";
import * as postsRepo from "@/modules/posts/posts.repository";
import { LocalStorageProvider } from "./local-storage-provider";
import * as repo from "./assets.repository";
import type { Asset, CreateAssetMetadataInput, UpdateAssetMetadataInput } from "./assets.types";
import {
  assertAllowedUpload,
  assertSafeStorageKey,
  buildUniqueSafeFilename,
  createAssetMetadataSchema,
  sanitizeFilename,
  updateAssetMetadataSchema,
} from "./assets.validation";
import { buildPostAssetStorageKey } from "./storage-keys";
import { createStorageProvider } from "./storage-provider-factory";
import type { StorageProvider } from "./storage-provider";

export { buildImageMarkdown } from "./assets.utils";

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    storageProvider = createStorageProvider();
  }
  return storageProvider;
}

export function setStorageProvider(provider: StorageProvider): void {
  storageProvider = provider;
}

export function resetStorageProvider(): void {
  storageProvider = null;
}

export async function createAssetMetadata(
  input: CreateAssetMetadataInput
): Promise<Asset> {
  const parsed = createAssetMetadataSchema.parse(input);

  if (parsed.fileSizeBytes > readUploadMaxFileSizeBytes()) {
    throw new ValidationError("File exceeds maximum upload size");
  }

  assertSafeStorageKey(parsed.storageKey);

  return repo.createAssetMetadataRecord({
    ...parsed,
    createdBy: input.createdBy,
  });
}

export async function listAssetsByPost(postId: string): Promise<Asset[]> {
  return repo.listAssetsByPostId(postId);
}

export async function getAssetById(id: string): Promise<Asset> {
  const asset = await repo.findAssetById(id);
  if (!asset) {
    throw new NotFoundError("Asset not found");
  }
  return asset;
}

export async function updateAssetMetadata(
  id: string,
  input: UpdateAssetMetadataInput
): Promise<Asset> {
  const parsed = updateAssetMetadataSchema.parse(input);
  const updated = await repo.updateAssetById(id, parsed);

  if (!updated) {
    throw new NotFoundError("Asset not found");
  }

  return updated;
}

export async function deleteAssetMetadata(id: string): Promise<void> {
  const asset = await repo.deleteAssetById(id);
  if (!asset) {
    throw new NotFoundError("Asset not found");
  }

  const provider = getStorageProvider();
  if (provider.name === asset.storageProvider) {
    await provider.delete(asset.storageKey);
  }
}

export function buildSafeFilename(originalFilename: string): string {
  return sanitizeFilename(originalFilename);
}

export async function assertAssetBelongsToPost(assetId: string, postId: string): Promise<Asset> {
  const asset = await getAssetById(assetId);
  if (asset.postId !== postId) {
    throw new ValidationError("Asset does not belong to this post");
  }
  return asset;
}

export type UploadPostAssetInput = {
  postId: string;
  buffer: Buffer;
  originalFilename: string;
  mimeType: string;
  altText?: string | null;
  caption?: string | null;
  userId: string;
};

export async function uploadPostAsset(input: UploadPostAssetInput): Promise<Asset> {
  const post = await postsRepo.findPostById(input.postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const mimeType = assertAllowedUpload({
    mimeType: input.mimeType,
    originalFilename: input.originalFilename,
    fileSizeBytes: input.buffer.length,
    maxFileSizeBytes: readUploadMaxFileSizeBytes(),
  });

  const provider = getStorageProvider();
  const existingAssets = await repo.listAssetsByPostId(input.postId);
  const safeFilename = buildUniqueSafeFilename(
    input.originalFilename,
    existingAssets.map((asset) => asset.safeFilename)
  );
  const storageKey = buildPostAssetStorageKey(input.postId, safeFilename);

  const uploaded = await provider.upload({
    storageKey,
    buffer: input.buffer,
    mimeType,
  });

  const hash = createHash("sha256").update(input.buffer).digest("hex");

  return createAssetMetadata({
    postId: input.postId,
    storageProvider: provider.name,
    storageKey: uploaded.storageKey,
    publicUrl: uploaded.publicUrl,
    originalFilename: input.originalFilename,
    safeFilename,
    mimeType,
    fileSizeBytes: input.buffer.length,
    altText: input.altText ?? null,
    caption: input.caption ?? null,
    hash,
    createdBy: input.userId,
  });
}

export async function deletePostAsset(assetId: string, userId: string): Promise<void> {
  const asset = await getAssetById(assetId);
  const post = await postsRepo.findPostById(asset.postId);

  if (post) {
    const updates: Partial<{ coverAssetId: null; ogAssetId: null; updatedBy: string }> = {
      updatedBy: userId,
    };
    if (post.coverAssetId === assetId) updates.coverAssetId = null;
    if (post.ogAssetId === assetId) updates.ogAssetId = null;

    if (updates.coverAssetId !== undefined || updates.ogAssetId !== undefined) {
      await postsRepo.updatePostById(post.id, updates);
    }
  }

  await deleteAssetMetadata(assetId);
}

export async function setPostCoverAsset(
  postId: string,
  assetId: string | null,
  userId: string
): Promise<void> {
  if (assetId) {
    await assertAssetBelongsToPost(assetId, postId);
  }

  const updated = await postsRepo.updatePostById(postId, {
    coverAssetId: assetId,
    updatedBy: userId,
  });

  if (!updated) {
    throw new NotFoundError("Post not found");
  }
}

export async function setPostOgAsset(
  postId: string,
  assetId: string | null,
  userId: string
): Promise<void> {
  if (assetId) {
    await assertAssetBelongsToPost(assetId, postId);
  }

  const updated = await postsRepo.updatePostById(postId, {
    ogAssetId: assetId,
    updatedBy: userId,
  });

  if (!updated) {
    throw new NotFoundError("Post not found");
  }
}

export async function readAssetFile(asset: Asset): Promise<Buffer> {
  if (asset.storageProvider !== "local") {
    throw new NotFoundError("Asset is not stored locally; use publicUrl for remote assets");
  }

  const provider = getStorageProvider();
  if (!(provider instanceof LocalStorageProvider)) {
    throw new NotFoundError("Local storage provider unavailable");
  }

  return provider.read(asset.storageKey);
}

export function guessMimeTypeFromStorageKey(storageKey: string): string {
  const lower = storageKey.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
