import { desc, eq } from "drizzle-orm";
import { db } from "@/db/get-db";
import { assets } from "./assets.schema";
import type { Asset, CreateAssetMetadataInput, NewAsset } from "./assets.types";

export async function insertAsset(values: NewAsset): Promise<Asset> {
  const [row] = await db.insert(assets).values(values).returning();
  return row;
}

export async function updateAssetById(
  id: string,
  values: Partial<NewAsset>
): Promise<Asset | undefined> {
  const [row] = await db
    .update(assets)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning();
  return row;
}

export async function findAssetById(id: string): Promise<Asset | undefined> {
  const [row] = await db.select().from(assets).where(eq(assets.id, id)).limit(1);
  return row;
}

export async function listAssetsByPostId(postId: string): Promise<Asset[]> {
  return db
    .select()
    .from(assets)
    .where(eq(assets.postId, postId))
    .orderBy(desc(assets.createdAt));
}

export async function deleteAssetById(id: string): Promise<Asset | undefined> {
  const [row] = await db.delete(assets).where(eq(assets.id, id)).returning();
  return row;
}

export async function createAssetMetadataRecord(
  input: CreateAssetMetadataInput
): Promise<Asset> {
  return insertAsset({
    postId: input.postId,
    storageProvider: input.storageProvider,
    storageKey: input.storageKey,
    publicUrl: input.publicUrl,
    originalFilename: input.originalFilename,
    safeFilename: input.safeFilename,
    mimeType: input.mimeType,
    fileSizeBytes: input.fileSizeBytes,
    width: input.width ?? null,
    height: input.height ?? null,
    altText: input.altText ?? null,
    caption: input.caption ?? null,
    hash: input.hash ?? null,
    createdBy: input.createdBy,
  });
}
