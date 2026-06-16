import { del, put } from "@vercel/blob";
import { assertSafeStorageKey } from "@/modules/assets/assets.validation";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "./storage-provider";

export class VercelBlobStorageProvider implements StorageProvider {
  readonly name = "vercel-blob";

  constructor(private readonly token: string) {
    if (!token.trim()) {
      throw new Error("BLOB_READ_WRITE_TOKEN is required when UPLOAD_PROVIDER=vercel-blob");
    }
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    assertSafeStorageKey(input.storageKey);

    const blob = await put(input.storageKey, input.buffer, {
      access: "public",
      contentType: input.mimeType,
      token: this.token,
      addRandomSuffix: false,
    });

    return {
      storageKey: blob.pathname,
      publicUrl: blob.url,
    };
  }

  async delete(storageKey: string): Promise<void> {
    assertSafeStorageKey(storageKey);
    await del(storageKey, { token: this.token });
  }

  getPublicUrl(): string {
    throw new Error(
      "Vercel Blob public URLs are assigned at upload time; use the stored asset publicUrl"
    );
  }
}
