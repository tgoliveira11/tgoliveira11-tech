import { beforeEach, describe, expect, it, vi } from "vitest";

const { uploadPostAssetMock } = vi.hoisted(() => ({
  uploadPostAssetMock: vi.fn(),
}));

vi.mock("@/modules/assets/assets.service", () => ({
  uploadPostAsset: uploadPostAssetMock,
}));

import { downloadAndUploadMainImage } from "@/modules/import/url-post-images";

describe("url post images", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    uploadPostAssetMock.mockResolvedValue({
      id: "asset-1",
      publicUrl: "/api/assets/posts/post-1/cover.jpg",
    });
  });

  it("downloads and uploads the main image through the asset service", async () => {
    const fetchImpl = async () =>
      new Response(Buffer.from("fake-image"), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      });

    const result = await downloadAndUploadMainImage({
      imageUrl: "https://example.com/cover.jpg",
      postId: "post-1",
      title: "Imported title",
      userId: "admin-1",
      fetchImpl,
    });

    expect(result.assetId).toBe("asset-1");
    expect(uploadPostAssetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: "post-1",
        mimeType: "image/jpeg",
        altText: "Imported title",
        caption: "Imported title",
      })
    );
  });
});
