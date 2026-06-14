import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { readUploadLocalDir, readUploadPublicBaseUrl } from "@/lib/env";
import { assertSafeStorageKey } from "@/modules/assets/assets.validation";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "./storage-provider";

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";

  constructor(
    private readonly rootDir = readUploadLocalDir(),
    private readonly publicBaseUrl = readUploadPublicBaseUrl()
  ) {}

  private resolvePath(storageKey: string): string {
    assertSafeStorageKey(storageKey);
    const resolved = path.resolve(this.rootDir, storageKey);
    const root = path.resolve(this.rootDir);

    if (!resolved.startsWith(root + path.sep) && resolved !== root) {
      throw new Error("Path traversal detected");
    }

    return resolved;
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    assertSafeStorageKey(input.storageKey);
    const filePath = this.resolvePath(input.storageKey);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.buffer);

    return {
      storageKey: input.storageKey,
      publicUrl: this.getPublicUrl(input.storageKey),
    };
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = this.resolvePath(storageKey);
    await rm(filePath, { force: true });
  }

  getPublicUrl(storageKey: string): string {
    assertSafeStorageKey(storageKey);
    const encoded = storageKey.split("/").map(encodeURIComponent).join("/");
    return `${this.publicBaseUrl.replace(/\/$/, "")}/${encoded}`;
  }

  buildStorageKey(postId: string, safeFilename: string): string {
    return `posts/${postId}/${safeFilename}`;
  }
}
