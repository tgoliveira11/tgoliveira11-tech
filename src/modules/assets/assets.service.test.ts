import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createAssetMetadataRecordMock,
  findAssetByIdMock,
  updateAssetByIdMock,
  deleteAssetByIdMock,
  listAssetsByPostIdMock,
  findPostByIdMock,
  updatePostByIdMock,
} = vi.hoisted(() => ({
  createAssetMetadataRecordMock: vi.fn(),
  findAssetByIdMock: vi.fn(),
  updateAssetByIdMock: vi.fn(),
  deleteAssetByIdMock: vi.fn(),
  listAssetsByPostIdMock: vi.fn(),
  findPostByIdMock: vi.fn(),
  updatePostByIdMock: vi.fn(),
}));

vi.mock("./assets.repository", () => ({
  createAssetMetadataRecord: createAssetMetadataRecordMock,
  findAssetById: findAssetByIdMock,
  updateAssetById: updateAssetByIdMock,
  deleteAssetById: deleteAssetByIdMock,
  listAssetsByPostId: listAssetsByPostIdMock,
}));

vi.mock("@/modules/posts/posts.repository", () => ({
  findPostById: findPostByIdMock,
  updatePostById: updatePostByIdMock,
}));

vi.mock("@/lib/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/env")>();
  return {
    ...actual,
    readUploadMaxFileSizeBytes: vi.fn(() => 5_000_000),
  };
});

import { LocalStorageProvider } from "./local-storage-provider";
import {
  assertAssetBelongsToPost,
  buildSafeFilename,
  createAssetMetadata,
  deleteAssetMetadata,
  deletePostAsset,
  getAssetById,
  getStorageProvider,
  guessMimeTypeFromStorageKey,
  resetStorageProvider,
  setPostCoverAsset,
  setPostOgAsset,
  setStorageProvider,
  updateAssetMetadata,
  uploadPostAsset,
  readAssetFile,
} from "./assets.service";
import { NotFoundError, ValidationError } from "@/lib/errors";

const postId = "550e8400-e29b-41d4-a716-446655440000";

const baseAsset = {
  id: "asset-1",
  postId,
  userId: "user-1",
  storageProvider: "local",
  storageKey: "posts/post-1/photo.jpg",
  publicUrl: "/uploads/posts/post-1/photo.jpg",
  originalFilename: "photo.jpg",
  safeFilename: "photo.jpg",
  mimeType: "image/jpeg",
  fileSizeBytes: 100,
  altText: null,
  caption: null,
  hash: "abc",
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("assets service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStorageProvider();
    findAssetByIdMock.mockResolvedValue(baseAsset);
    findPostByIdMock.mockResolvedValue({
      id: postId,
      coverAssetId: "asset-1",
      ogAssetId: null,
    });
    updatePostByIdMock.mockResolvedValue({ id: "post-1" });
    deleteAssetByIdMock.mockResolvedValue(baseAsset);
    listAssetsByPostIdMock.mockResolvedValue([]);
  });

  it("manages storage provider singleton", () => {
    const custom = { name: "custom", upload: vi.fn(), delete: vi.fn() } as never;
    setStorageProvider(custom);
    expect(getStorageProvider()).toBe(custom);
    resetStorageProvider();
    expect(getStorageProvider().name).toBeTruthy();
  });

  it("creates asset metadata with validation", async () => {
    createAssetMetadataRecordMock.mockResolvedValue(baseAsset);

    const asset = await createAssetMetadata({
      postId,
      storageProvider: "local",
      storageKey: "posts/post-1/photo.jpg",
      publicUrl: "/uploads/posts/post-1/photo.jpg",
      originalFilename: "photo.jpg",
      safeFilename: "photo.jpg",
      mimeType: "image/jpeg",
      fileSizeBytes: 100,
      hash: "abc",
      createdBy: "user-1",
    });

    expect(asset.id).toBe("asset-1");
  });

  it("rejects oversized uploads", async () => {
    await expect(
      createAssetMetadata({
        postId,
        storageProvider: "local",
        storageKey: "posts/post-1/photo.jpg",
        publicUrl: "/uploads/posts/post-1/photo.jpg",
        originalFilename: "photo.jpg",
        safeFilename: "photo.jpg",
        mimeType: "image/jpeg",
        fileSizeBytes: 9_000_000,
        hash: "abc",
        createdBy: "user-1",
      })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("gets and updates asset metadata", async () => {
    updateAssetByIdMock.mockResolvedValue(baseAsset);
    await expect(getAssetById("asset-1")).resolves.toEqual(baseAsset);
    await expect(updateAssetMetadata("asset-1", { altText: "Alt" })).resolves.toEqual(baseAsset);
  });

  it("throws when asset metadata is missing", async () => {
    findAssetByIdMock.mockResolvedValue(undefined);
    await expect(getAssetById("missing")).rejects.toBeInstanceOf(NotFoundError);
    updateAssetByIdMock.mockResolvedValue(null);
    findAssetByIdMock.mockResolvedValue(baseAsset);
    await expect(updateAssetMetadata("asset-1", { altText: "Alt" })).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("deletes asset metadata and storage object for matching provider", async () => {
    const provider = {
      name: "local",
      upload: vi.fn(),
      delete: vi.fn(),
    };
    setStorageProvider(provider as never);

    await deleteAssetMetadata("asset-1");
    expect(provider.delete).toHaveBeenCalledWith(baseAsset.storageKey);
  });

  it("asserts asset belongs to post", async () => {
    await expect(assertAssetBelongsToPost("asset-1", postId)).resolves.toEqual(baseAsset);
    await expect(assertAssetBelongsToPost("asset-1", "other-post")).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it("uploads post asset", async () => {
    const provider = {
      name: "local",
      upload: vi.fn().mockResolvedValue({
        storageKey: "posts/post-1/photo.jpg",
        publicUrl: "/uploads/posts/post-1/photo.jpg",
      }),
      delete: vi.fn(),
    };
    setStorageProvider(provider as never);
    createAssetMetadataRecordMock.mockResolvedValue(baseAsset);

    const asset = await uploadPostAsset({
      postId,
      buffer: Buffer.from("image"),
      originalFilename: "photo.jpg",
      mimeType: "image/jpeg",
      userId: "user-1",
    });

    expect(asset.id).toBe("asset-1");
    expect(provider.upload).toHaveBeenCalled();
  });

  it("rejects upload when post is missing", async () => {
    findPostByIdMock.mockResolvedValue(undefined);
    await expect(
      uploadPostAsset({
        postId: "missing",
        buffer: Buffer.from("image"),
        originalFilename: "photo.jpg",
        mimeType: "image/jpeg",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("deletes post asset and clears cover reference", async () => {
    const provider = { name: "local", upload: vi.fn(), delete: vi.fn() };
    setStorageProvider(provider as never);

    await deletePostAsset("asset-1", "user-1");
    expect(updatePostByIdMock).toHaveBeenCalledWith(postId, {
      coverAssetId: null,
      updatedBy: "user-1",
    });
  });

  it("sets cover and og assets", async () => {
    await setPostCoverAsset(postId, "asset-1", "user-1");
    await setPostOgAsset(postId, null, "user-1");
    expect(updatePostByIdMock).toHaveBeenCalled();
  });

  it("throws when setting cover on missing post", async () => {
    updatePostByIdMock.mockResolvedValue(null);
    await expect(setPostCoverAsset("missing", null, "user-1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("sanitizes filenames and guesses mime types", () => {
    expect(buildSafeFilename("My Photo.JPG")).toBe("My-Photo.JPG");
    expect(guessMimeTypeFromStorageKey("a.png")).toBe("image/png");
    expect(guessMimeTypeFromStorageKey("a.gif")).toBe("image/gif");
    expect(guessMimeTypeFromStorageKey("a.webp")).toBe("image/webp");
    expect(guessMimeTypeFromStorageKey("a.jpg")).toBe("image/jpeg");
  });

  it("reads local asset files through local provider", async () => {
    const provider = new LocalStorageProvider("/tmp");
    provider.read = vi.fn().mockResolvedValue(Buffer.from("data"));
    setStorageProvider(provider);

    const buffer = await readAssetFile({ ...baseAsset, storageProvider: "local" });
    expect(buffer.toString()).toBe("data");
  });
});

