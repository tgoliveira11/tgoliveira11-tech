import { describe, expect, it } from "vitest";
import {
  assertAllowedUpload,
  buildUniqueSafeFilename,
  getFileExtension,
  sanitizeFilename,
} from "@/modules/assets/assets.validation";
import { buildImageMarkdown } from "@/modules/assets/assets.utils";

describe("asset upload validation", () => {
  it("sanitizes filenames and builds unique names", () => {
    expect(sanitizeFilename("../../secret.png")).not.toContain("..");
    expect(buildUniqueSafeFilename("photo.png", ["photo.png"])).toBe("photo-2.png");
  });

  it("validates MIME type and extension", () => {
    expect(() =>
      assertAllowedUpload({
        mimeType: "image/jpeg",
        originalFilename: "photo.jpg",
        fileSizeBytes: 100,
        maxFileSizeBytes: 1024,
      })
    ).not.toThrow();

    expect(() =>
      assertAllowedUpload({
        mimeType: "image/svg+xml",
        originalFilename: "icon.svg",
        fileSizeBytes: 100,
        maxFileSizeBytes: 1024,
      })
    ).toThrow(/SVG uploads are not allowed/);
  });

  it("rejects mismatched extensions and oversize files", () => {
    expect(() =>
      assertAllowedUpload({
        mimeType: "image/png",
        originalFilename: "photo.jpg",
        fileSizeBytes: 100,
        maxFileSizeBytes: 1024,
      })
    ).toThrow(/extension/i);

    expect(() =>
      assertAllowedUpload({
        mimeType: "image/png",
        originalFilename: "photo.png",
        fileSizeBytes: 2000,
        maxFileSizeBytes: 1000,
      })
    ).toThrow(/maximum upload size/i);
  });

  it("builds markdown with alt fallback", () => {
    const markdown = buildImageMarkdown({
      altText: "Diagram",
      originalFilename: "diagram.png",
      publicUrl: "/api/assets/posts/id/diagram.png",
    });
    expect(markdown).toBe("![Diagram](/api/assets/posts/id/diagram.png)");
    expect(getFileExtension("photo.webp")).toBe(".webp");
  });
});
