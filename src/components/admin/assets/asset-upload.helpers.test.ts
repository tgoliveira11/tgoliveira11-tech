import { describe, expect, it } from "vitest";
import {
  ASSET_UPLOAD_ACCEPT,
  ASSET_UPLOAD_INPUT_NAME,
  pickFirstImageFile,
} from "@/components/admin/assets/asset-upload.helpers";
import { formatBytesHuman } from "@/lib/format-bytes";
import {
  EDITOR_CONTENT_MIN_HEIGHT_CLASS,
  EDITOR_EXCERPT_CLASS,
  POST_EDITOR_FIELD_NAMES,
} from "@/components/admin/posts/editor-constants";

describe("asset upload helpers", () => {
  it("uses file as the FormData key for uploads", () => {
    expect(ASSET_UPLOAD_INPUT_NAME).toBe("file");
    expect(ASSET_UPLOAD_ACCEPT).toContain("image/jpeg");
    expect(ASSET_UPLOAD_ACCEPT).not.toContain("image/svg");
  });

  it("picks the first file from a drop and reports extras", () => {
    const first = new File(["a"], "one.jpg", { type: "image/jpeg" });
    const second = new File(["b"], "two.png", { type: "image/png" });
    const result = pickFirstImageFile([first, second]);
    expect(result.file).toBe(first);
    expect(result.ignoredExtraCount).toBe(1);
  });

  it("returns null when no files are provided", () => {
    const result = pickFirstImageFile([]);
    expect(result.file).toBeNull();
    expect(result.ignoredExtraCount).toBe(0);
  });

  it("formats upload max size for human-readable helper text", () => {
    expect(formatBytesHuman(5 * 1024 * 1024)).toBe("5 MB");
  });
});

describe("post editor layout contract", () => {
  it("keeps contentMarkdown in the editor form field list", () => {
    expect(POST_EDITOR_FIELD_NAMES).toContain("contentMarkdown");
    expect(POST_EDITOR_FIELD_NAMES).toContain("excerpt");
  });

  it("defines reusable excerpt and content height classes", () => {
    expect(EDITOR_EXCERPT_CLASS).toContain("min-h-[7rem]");
    expect(EDITOR_CONTENT_MIN_HEIGHT_CLASS).toContain("clamp");
    expect(EDITOR_CONTENT_MIN_HEIGHT_CLASS).toContain("xl:min-h-[clamp(32.5rem,65vh,47.5rem)]");
  });
});
