import { readUploadMaxFileSizeBytes } from "@/lib/env";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { LocalStorageProvider } from "./local-storage-provider";
import * as repo from "./assets.repository";
import type { Asset, CreateAssetMetadataInput, UpdateAssetMetadataInput } from "./assets.types";
import {
  assertSafeStorageKey,
  createAssetMetadataSchema,
  sanitizeFilename,
  updateAssetMetadataSchema,
} from "./assets.validation";
import type { StorageProvider } from "./storage-provider";

let storageProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!storageProvider) {
    storageProvider = new LocalStorageProvider();
  }
  return storageProvider;
}

export function setStorageProvider(provider: StorageProvider): void {
  storageProvider = provider;
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
