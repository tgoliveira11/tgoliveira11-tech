import { beforeEach, describe, expect, it, vi } from "vitest";

const { putMock, delMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
  delMock: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
  put: putMock,
  del: delMock,
}));

import { VercelBlobStorageProvider } from "@/modules/assets/vercel-blob-storage-provider";

describe("VercelBlobStorageProvider", () => {
  beforeEach(() => {
    putMock.mockReset();
    delMock.mockReset();
  });

  it("requires a token at construction", () => {
    expect(() => new VercelBlobStorageProvider("")).toThrow(/BLOB_READ_WRITE_TOKEN/);
  });

  it("uploads with public access and returns Blob URL metadata", async () => {
    putMock.mockResolvedValue({
      pathname: "posts/post-1/photo.png",
      url: "https://abc.public.blob.vercel-storage.com/posts/post-1/photo.png",
    });

    const provider = new VercelBlobStorageProvider("test-token");
    const result = await provider.upload({
      storageKey: "posts/post-1/photo.png",
      buffer: Buffer.from("image-bytes"),
      mimeType: "image/png",
    });

    expect(putMock).toHaveBeenCalledWith(
      "posts/post-1/photo.png",
      expect.any(Buffer),
      expect.objectContaining({
        access: "public",
        contentType: "image/png",
        token: "test-token",
        addRandomSuffix: false,
      })
    );
    expect(result).toEqual({
      storageKey: "posts/post-1/photo.png",
      publicUrl: "https://abc.public.blob.vercel-storage.com/posts/post-1/photo.png",
    });
    expect(provider.name).toBe("vercel-blob");
  });

  it("rejects path traversal in storage keys", async () => {
    const provider = new VercelBlobStorageProvider("test-token");
    await expect(
      provider.upload({
        storageKey: "../outside.png",
        buffer: Buffer.from("x"),
        mimeType: "image/png",
      })
    ).rejects.toThrow(/Invalid storage key/);
    expect(putMock).not.toHaveBeenCalled();
  });

  it("deletes blobs by storage key", async () => {
    const provider = new VercelBlobStorageProvider("test-token");
    await provider.delete("posts/post-1/photo.png");
    expect(delMock).toHaveBeenCalledWith("posts/post-1/photo.png", {
      token: "test-token",
    });
  });

  it("does not derive public URLs from storage keys", () => {
    const provider = new VercelBlobStorageProvider("test-token");
    expect(() => provider.getPublicUrl("posts/post-1/photo.png")).toThrow(/upload time/);
  });
});
