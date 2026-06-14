import { describe, expect, it } from "vitest";
import { isValidSlug, normalizeSlug, slugFromTitle } from "@/modules/posts/slug";

describe("slug utilities", () => {
  it("normalizes titles into URL-safe slugs", () => {
    expect(normalizeSlug("  Hello World! ")).toBe("hello-world");
    expect(normalizeSlug("Post   With---Hyphens")).toBe("post-with-hyphens");
  });

  it("generates fallback slug from title", () => {
    expect(slugFromTitle("My First Post")).toBe("my-first-post");
    expect(slugFromTitle("!!!")).toBe("post");
  });

  it("validates slug pattern", () => {
    expect(isValidSlug("valid-slug-123")).toBe(true);
    expect(isValidSlug("Invalid_Slug")).toBe(false);
    expect(isValidSlug("-bad")).toBe(false);
  });
});
