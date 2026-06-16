import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  getAssetByIdMock,
  deletePostAssetMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  getAssetByIdMock: vi.fn(),
  deletePostAssetMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/assets/assets.service", () => ({
  getAssetById: getAssetByIdMock,
  deletePostAsset: deletePostAssetMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/admin/revalidate-public", () => ({
  revalidatePublicPaths: vi.fn(),
}));

import { deleteAssetAction } from "@/modules/assets/admin-assets.actions";

describe("admin-assets actions security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    getAssetByIdMock.mockResolvedValue({ id: "asset-1", postId: "post-1", userId: "admin-1" });
    deletePostAssetMock.mockResolvedValue(undefined);
  });

  it("rejects deletion when admin session is missing", async () => {
    requireAdminSessionMock.mockRejectedValue(new Error("Forbidden"));

    const result = await deleteAssetAction("asset-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });
});

