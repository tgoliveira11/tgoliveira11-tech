import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LocalStorageProvider } from "@/modules/assets/local-storage-provider";

describe("LocalStorageProvider", () => {
  let tempDir: string;
  let provider: LocalStorageProvider;

  beforeEach(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "postforge-upload-"));
    provider = new LocalStorageProvider(tempDir, "/api/assets");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("uploads and serves files under the configured root", async () => {
    const storageKey = provider.buildStorageKey("post-id", "photo.png");
    const result = await provider.upload({
      storageKey,
      buffer: Buffer.from("fake-image"),
      mimeType: "image/png",
    });

    expect(result.publicUrl).toBe("/api/assets/posts/post-id/photo.png");
    const stored = await readFile(path.join(tempDir, storageKey), "utf8");
    expect(stored).toBe("fake-image");
  });

  it("rejects path traversal on delete", async () => {
    await expect(provider.delete("../outside.txt")).rejects.toThrow(/Invalid storage key|Path traversal/);
  });

  it("does not overwrite storage keys accidentally when filenames differ", async () => {
    const firstKey = provider.buildStorageKey("post-id", "photo.png");
    const secondKey = provider.buildStorageKey("post-id", "photo-2.png");

    await provider.upload({ storageKey: firstKey, buffer: Buffer.from("one"), mimeType: "image/png" });
    await provider.upload({ storageKey: secondKey, buffer: Buffer.from("two"), mimeType: "image/png" });

    expect(await provider.read(firstKey)).toEqual(Buffer.from("one"));
    expect(await provider.read(secondKey)).toEqual(Buffer.from("two"));
  });
});
