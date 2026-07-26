import { del, put } from "@vercel/blob";
import { assertSafeStorageKey } from "@/modules/assets/assets.validation";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "./storage-provider";

export type VercelBlobCredentials =
  | { token: string }
  | { oidcToken: string; storeId: string };

export class VercelBlobStorageProvider implements StorageProvider {
  readonly name = "vercel-blob";
  private readonly credentials: VercelBlobCredentials;

  constructor(credentials: string | VercelBlobCredentials) {
    if (typeof credentials === "string") {
      const token = credentials.trim();
      if (token) {
        this.credentials = { token };
        return;
      }
    } else if ("token" in credentials) {
      const token = credentials.token.trim();
      if (token) {
        this.credentials = { token };
        return;
      }
    } else {
      const oidcToken = credentials.oidcToken.trim();
      const storeId = credentials.storeId.trim();
      if (oidcToken && storeId) {
        this.credentials = { oidcToken, storeId };
        return;
      }
    }

    throw new Error(
      "Vercel Blob credentials are required when UPLOAD_PROVIDER=vercel-blob; set " +
        "VERCEL_OIDC_TOKEN with BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN"
    );
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    assertSafeStorageKey(input.storageKey);

    const blob = await put(input.storageKey, input.buffer, {
      access: "public",
      contentType: input.mimeType,
      addRandomSuffix: false,
      ...this.credentials,
    });

    return {
      storageKey: blob.pathname,
      publicUrl: blob.url,
    };
  }

  async delete(storageKey: string): Promise<void> {
    assertSafeStorageKey(storageKey);
    await del(storageKey, this.credentials);
  }

  getPublicUrl(): string {
    throw new Error(
      "Vercel Blob public URLs are assigned at upload time; use the stored asset publicUrl"
    );
  }
}
