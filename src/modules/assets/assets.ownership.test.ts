import { beforeEach, describe, expect, it, vi } from "vitest";

const { findAssetByIdMock } = vi.hoisted(() => ({
  findAssetByIdMock: vi.fn(),
}));

vi.mock("@/modules/assets/assets.repository", () => ({
  findAssetById: findAssetByIdMock,
}));

import { assertAssetBelongsToPost } from "@/modules/assets/assets.service";

describe("assertAssetBelongsToPost", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects attaching an asset from another post as cover or og", async () => {
    findAssetByIdMock.mockResolvedValue({
      id: "asset-1",
      postId: "post-a",
    });

    await expect(assertAssetBelongsToPost("asset-1", "post-b")).rejects.toThrow(/belong/i);
  });

  it("allows assets that belong to the same post", async () => {
    findAssetByIdMock.mockResolvedValue({
      id: "asset-1",
      postId: "post-a",
    });

    await expect(assertAssetBelongsToPost("asset-1", "post-a")).resolves.toMatchObject({
      id: "asset-1",
      postId: "post-a",
    });
  });
});
