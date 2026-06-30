import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminSessionMock,
  getAssetByIdMock,
  deletePostAssetMock,
  updateAssetMetadataMock,
  setPostCoverAssetMock,
  setPostOgAssetMock,
  getByIdMock,
} = vi.hoisted(() => ({
  requireAdminSessionMock: vi.fn(),
  getAssetByIdMock: vi.fn(),
  deletePostAssetMock: vi.fn(),
  updateAssetMetadataMock: vi.fn(),
  setPostCoverAssetMock: vi.fn(),
  setPostOgAssetMock: vi.fn(),
  getByIdMock: vi.fn(),
}));

vi.mock("@/modules/admin/authorization", () => ({
  requireAdminSession: requireAdminSessionMock,
}));

vi.mock("@/modules/assets/assets.service", () => ({
  getAssetById: getAssetByIdMock,
  deletePostAsset: deletePostAssetMock,
  updateAssetMetadata: updateAssetMetadataMock,
  setPostCoverAsset: setPostCoverAssetMock,
  setPostOgAsset: setPostOgAssetMock,
}));

vi.mock("@/modules/posts/posts.service", () => ({
  getById: getByIdMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/modules/admin/revalidate-public", () => ({
  revalidatePublicPaths: vi.fn(),
}));

import {
  deleteAssetAction,
  setPostCoverAssetAction,
  setPostOgAssetAction,
  updateAssetMetadataAction,
} from "@/modules/assets/admin-assets.actions";

const postId = "550e8400-e29b-41d4-a716-446655440000";

describe("admin-assets actions security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminSessionMock.mockResolvedValue({ user: { id: "admin-1" } });
    getAssetByIdMock.mockResolvedValue({ id: "asset-1", postId, userId: "admin-1" });
    deletePostAssetMock.mockResolvedValue(undefined);
    updateAssetMetadataMock.mockResolvedValue({ id: "asset-1", postId });
    setPostCoverAssetMock.mockResolvedValue(undefined);
    setPostOgAssetMock.mockResolvedValue(undefined);
    getByIdMock.mockResolvedValue({ id: postId, slug: "hello-world" });
  });

  it("rejects deletion when admin session is missing", async () => {
    requireAdminSessionMock.mockRejectedValue(new Error("Forbidden"));

    const result = await deleteAssetAction("asset-1");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Forbidden");
  });

  it("deletes assets successfully", async () => {
    const result = await deleteAssetAction("asset-1");
    expect(result).toEqual({ ok: true, message: "Asset deleted" });
    expect(deletePostAssetMock).toHaveBeenCalledWith("asset-1", "admin-1");
  });

  it("updates asset metadata with caption only", async () => {
    const formData = new FormData();
    formData.set("caption", "A caption");

    const result = await updateAssetMetadataAction("asset-1", { ok: false }, formData);
    expect(result.ok).toBe(true);
    expect(updateAssetMetadataMock).toHaveBeenCalledWith("asset-1", { caption: "A caption" });
  });

  it("sets and clears cover and og assets", async () => {
    await expect(setPostCoverAssetAction(postId, "asset-1")).resolves.toEqual({
      ok: true,
      message: "Cover image set",
    });
    await expect(setPostCoverAssetAction(postId, null)).resolves.toEqual({
      ok: true,
      message: "Cover image cleared",
    });
    await expect(setPostOgAssetAction(postId, "asset-1")).resolves.toEqual({
      ok: true,
      message: "OG image set",
    });
    await expect(setPostOgAssetAction(postId, null)).resolves.toEqual({
      ok: true,
      message: "OG image cleared",
    });
  });

  it("updates alt text and empty optional fields", async () => {
    const formData = new FormData();
    formData.set("altText", "");
    formData.set("caption", "Caption");

    const result = await updateAssetMetadataAction("asset-1", { ok: false }, formData);
    expect(result.ok).toBe(true);
    expect(updateAssetMetadataMock).toHaveBeenCalledWith("asset-1", {
      altText: null,
      caption: "Caption",
    });
  });

  it("updates alt text when caption is omitted", async () => {
    const formData = new FormData();
    formData.set("altText", "Hero image");

    const result = await updateAssetMetadataAction("asset-1", { ok: false }, formData);
    expect(result).toEqual({ ok: true, message: "Asset updated" });
    expect(updateAssetMetadataMock).toHaveBeenCalledWith("asset-1", { altText: "Hero image" });
  });

  it("maps unknown errors to a generic message", async () => {
    requireAdminSessionMock.mockRejectedValue("denied");
    const result = await deleteAssetAction("asset-1");
    expect(result).toEqual({ ok: false, error: "Something went wrong" });
  });

  it("maps AppError and action failures for cover updates", async () => {
    const { AppError } = await import("@/lib/errors");
    setPostCoverAssetMock.mockRejectedValue(new AppError("Cover not allowed"));
    await expect(setPostCoverAssetAction(postId, "asset-1")).resolves.toEqual({
      ok: false,
      error: "Cover not allowed",
    });

    setPostOgAssetMock.mockRejectedValue(new Error("OG failed"));
    await expect(setPostOgAssetAction(postId, "asset-1")).resolves.toEqual({
      ok: false,
      error: "OG failed",
    });

    updateAssetMetadataMock.mockRejectedValue(new AppError("Invalid metadata"));
    const formData = new FormData();
    formData.set("caption", "Caption");
    await expect(updateAssetMetadataAction("asset-1", { ok: false }, formData)).resolves.toEqual({
      ok: false,
      error: "Invalid metadata",
    });
  });
});

