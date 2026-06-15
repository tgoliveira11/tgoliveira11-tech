import { describe, expect, it } from "vitest";
import { parseUpdatePostFormData, readPostEditorIntent } from "@/modules/posts/admin-posts.form";

function form(entries: Record<string, string | string[]>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        formData.append(key, item);
      }
    } else {
      formData.set(key, value);
    }
  }
  return formData;
}

describe("admin post editor form parsing", () => {
  it("reads publish intent from submit button value", () => {
    expect(readPostEditorIntent(form({ intent: "publish" }))).toBe("publish");
    expect(readPostEditorIntent(form({ intent: "save" }))).toBe("save");
    expect(readPostEditorIntent(form({}))).toBe("save");
  });

  it("parses title, slug, excerpt, and contentMarkdown from FormData", () => {
    const parsed = parseUpdatePostFormData(
      form({
        title: "Hello world",
        slug: "hello-world",
        excerpt: "Short summary",
        contentMarkdown: "# Heading\n\nBody copy",
        createRevision: "true",
      })
    );

    expect(parsed.title).toBe("Hello world");
    expect(parsed.slug).toBe("hello-world");
    expect(parsed.excerpt).toBe("Short summary");
    expect(parsed.contentMarkdown).toBe("# Heading\n\nBody copy");
    expect(parsed.createRevision).toBe(true);
  });

  it("does not include cover or og asset ids when they are absent from the form", () => {
    const parsed = parseUpdatePostFormData(
      form({
        title: "Hello",
        contentMarkdown: "Body",
      })
    );

    expect(parsed.coverAssetId).toBeUndefined();
    expect(parsed.ogAssetId).toBeUndefined();
  });

  it("rejects empty titles", () => {
    expect(() =>
      parseUpdatePostFormData(
        form({
          title: "",
          contentMarkdown: "Body",
        })
      )
    ).toThrow();
  });
});
