import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  safeFetchHtmlMock,
  createDraftMock,
  updateDraftMock,
  downloadAndUploadMainImageMock,
  createRedirectMock,
} = vi.hoisted(() => ({
  safeFetchHtmlMock: vi.fn(),
  createDraftMock: vi.fn(),
  updateDraftMock: vi.fn(),
  downloadAndUploadMainImageMock: vi.fn(),
  createRedirectMock: vi.fn(),
}));

vi.mock("@/modules/import/url-fetch", () => ({
  safeFetchHtml: safeFetchHtmlMock,
}));

vi.mock("@/modules/posts/posts.service", () => ({
  createDraft: createDraftMock,
  updateDraft: updateDraftMock,
}));

vi.mock("@/modules/import/url-post-images", () => ({
  downloadAndUploadMainImage: downloadAndUploadMainImageMock,
}));

vi.mock("@/modules/redirects/redirects.service", () => ({
  createRedirect: createRedirectMock,
}));

import { importPostFromUrl } from "@/modules/import/url-post-importer";

const SAMPLE_HTML = `<!DOCTYPE html><html><body><article>
<h1>Imported Title</h1>
<h2>Imported subtitle</h2>
<p>${"Article body content. ".repeat(10)}</p>
<img src="https://example.com/cover.jpg">
</article></body></html>`;

describe("url post importer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    safeFetchHtmlMock.mockResolvedValue({
      finalUrl: "https://example.com/2023-06-16-imported-post/",
      contentType: "text/html",
      body: Buffer.from(SAMPLE_HTML),
    });
    createDraftMock.mockResolvedValue({
      id: "post-1",
      slug: "2023-06-16-imported-post",
      status: "draft",
    });
    updateDraftMock.mockResolvedValue({
      id: "post-1",
      slug: "2023-06-16-imported-post",
      status: "draft",
    });
    downloadAndUploadMainImageMock.mockResolvedValue({
      assetId: "asset-1",
      publicUrl: "/api/assets/posts/post-1/cover.jpg",
      sourceUrl: "https://example.com/cover.jpg",
    });
    createRedirectMock.mockResolvedValue({});
  });

  it("creates a draft post with imported metadata", async () => {
    const result = await importPostFromUrl({
      url: "https://example.com/2023-06-16-imported-post/",
      createRedirect: false,
      userId: "admin-1",
    });

    expect(result.postId).toBe("post-1");
    expect(createDraftMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Imported Title",
        slug: "2023-06-16-imported-post",
        excerpt: "Imported subtitle",
      }),
      "admin-1"
    );
    expect(updateDraftMock).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        coverAssetId: "asset-1",
        ogAssetId: "asset-1",
        seoTitle: "Imported Title",
      }),
      "admin-1"
    );
    expect(result.report.mainImageImported).toBe(true);
  });

  it("does not publish the imported post", async () => {
    await importPostFromUrl({
      url: "https://example.com/2023-06-16-imported-post/",
      createRedirect: false,
      userId: "admin-1",
    });

    expect(createDraftMock).toHaveBeenCalled();
    const createArgs = createDraftMock.mock.calls[0]?.[0];
    expect(createArgs).toBeDefined();
  });

  it("records a warning when slug is adjusted for duplicates", async () => {
    createDraftMock.mockResolvedValue({
      id: "post-1",
      slug: "2023-06-16-imported-post-2",
      status: "draft",
    });

    const result = await importPostFromUrl({
      url: "https://example.com/2023-06-16-imported-post/",
      createRedirect: false,
      userId: "admin-1",
    });

    expect(result.report.warnings.some((warning) => warning.includes("already exists"))).toBe(true);
  });

  it("continues when image upload fails", async () => {
    downloadAndUploadMainImageMock.mockRejectedValue(new Error("upload failed"));

    const result = await importPostFromUrl({
      url: "https://example.com/2023-06-16-imported-post/",
      createRedirect: false,
      userId: "admin-1",
    });

    expect(result.postId).toBe("post-1");
    expect(result.report.mainImageImported).toBe(false);
    expect(result.report.warnings.some((warning) => warning.includes("Main image"))).toBe(true);
  });
});
