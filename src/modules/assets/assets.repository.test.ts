import { beforeEach, describe, expect, it, vi } from "vitest";

function drizzleResult<T>(value: T) {
  const promise = Promise.resolve(value);
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "then") {
          return promise.then.bind(promise);
        }
        return () => drizzleResult(value);
      },
    }
  );
}

const postId = "550e8400-e29b-41d4-a716-446655440000";

const sampleAsset = {
  id: "asset-1",
  postId,
  storageProvider: "local",
  storageKey: "posts/hello/photo.jpg",
  publicUrl: "/uploads/photo.jpg",
  originalFilename: "photo.jpg",
  safeFilename: "photo.jpg",
  mimeType: "image/jpeg",
  fileSizeBytes: 100,
  altText: null,
  caption: null,
  hash: null,
  createdBy: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const { insertMock, selectMock, updateMock, deleteMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  updateMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/db/get-db", () => ({
  db: {
    insert: insertMock,
    select: selectMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

import {
  createAssetMetadataRecord,
  deleteAssetById,
  findAssetById,
  insertAsset,
  listAssetsByPostId,
  updateAssetById,
} from "./assets.repository";

describe("assets repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockImplementation(() => ({
      values: () => ({
        returning: () => Promise.resolve([sampleAsset]),
      }),
    }));
    updateMock.mockImplementation(() => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve([sampleAsset]),
        }),
      }),
    }));
    deleteMock.mockImplementation(() => ({
      where: () => ({
        returning: () => Promise.resolve([sampleAsset]),
      }),
    }));
    selectMock.mockImplementation(() => ({
      from: () => drizzleResult([sampleAsset]),
    }));
  });

  it("inserts and updates assets", async () => {
    await expect(insertAsset(sampleAsset)).resolves.toEqual(sampleAsset);
    await expect(updateAssetById("asset-1", { altText: "Alt" })).resolves.toEqual(sampleAsset);
  });

  it("finds and lists assets", async () => {
    await expect(findAssetById("asset-1")).resolves.toEqual(sampleAsset);
    await expect(listAssetsByPostId(postId)).resolves.toEqual([sampleAsset]);
  });

  it("creates metadata records and deletes assets", async () => {
    await expect(
      createAssetMetadataRecord({
        postId,
        storageProvider: "local",
        storageKey: sampleAsset.storageKey,
        publicUrl: sampleAsset.publicUrl,
        originalFilename: sampleAsset.originalFilename,
        safeFilename: sampleAsset.safeFilename,
        mimeType: "image/jpeg",
        fileSizeBytes: 100,
        createdBy: "user-1",
      })
    ).resolves.toEqual(sampleAsset);

    await expect(deleteAssetById("asset-1")).resolves.toEqual(sampleAsset);
    deleteMock.mockImplementationOnce(() => ({
      where: () => ({
        returning: () => Promise.resolve([]),
      }),
    }));
    await expect(deleteAssetById("missing")).resolves.toBeUndefined();
  });
});
