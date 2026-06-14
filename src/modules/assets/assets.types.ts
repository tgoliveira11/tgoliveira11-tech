import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { assets } from "./assets.schema";

export type Asset = InferSelectModel<typeof assets>;
export type NewAsset = InferInsertModel<typeof assets>;

export type CreateAssetMetadataInput = {
  postId: string;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
  originalFilename: string;
  safeFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  hash?: string | null;
  createdBy: string;
};

export type UpdateAssetMetadataInput = {
  altText?: string | null;
  caption?: string | null;
};
