import { describe, expect, it } from "vitest";
import { POST_EDITOR_FIELD_NAMES } from "@/components/admin/posts/editor-constants";
import { parseUpdatePostFormData } from "@/modules/posts/admin-posts.form";

describe("post editor form contract", () => {
  it("documents required field names for updatePostAction", () => {
    expect(POST_EDITOR_FIELD_NAMES).toContain("contentMarkdown");
    expect(POST_EDITOR_FIELD_NAMES).toContain("title");
    expect(POST_EDITOR_FIELD_NAMES).toContain("slug");
    expect(POST_EDITOR_FIELD_NAMES).toContain("intent");
    expect(POST_EDITOR_FIELD_NAMES).not.toContain("coverAssetId");
    expect(POST_EDITOR_FIELD_NAMES).not.toContain("ogAssetId");
  });

  it("parses promotion booleans submitted as true/false strings", () => {
    const formData = new FormData();
    formData.set("title", "Hello");
    formData.set("contentMarkdown", "Body");
    formData.set("featured", "true");
    formData.set("pinned", "false");
    formData.set("pinnedPriority", "0");

    const parsed = parseUpdatePostFormData(formData);
    expect(parsed.featured).toBe(true);
    expect(parsed.pinned).toBe(false);
    expect(parsed.coverAssetId).toBeUndefined();
    expect(parsed.ogAssetId).toBeUndefined();
  });

  it("parses multiple tag IDs from the editor form", () => {
    const formData = new FormData();
    formData.append("tagIds", "550e8400-e29b-41d4-a716-446655440000");
    formData.append("tagIds", "660e8400-e29b-41d4-a716-446655440001");

    const parsed = parseUpdatePostFormData(formData);
    expect(parsed.tagIds).toEqual([
      "550e8400-e29b-41d4-a716-446655440000",
      "660e8400-e29b-41d4-a716-446655440001",
    ]);
  });
});
