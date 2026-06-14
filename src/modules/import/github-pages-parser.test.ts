import { describe, expect, it } from "vitest";
import {
  deriveDesiredSlug,
  deriveOldPaths,
  deriveSlugFromFilename,
  deriveSlugFromPermalink,
  parseLegacyDate,
} from "./github-pages-parser";
import { normalizeTagOrCategoryList, normalizeUrlPath, resolveSafePath } from "./github-pages.validation";

describe("github-pages parser", () => {
  it("derives slug from frontmatter slug", () => {
    expect(
      deriveDesiredSlug({ slug: "Custom-Slug" }, "/tmp/ignored.md")
    ).toBe("custom-slug");
  });

  it("derives slug from permalink", () => {
    expect(deriveSlugFromPermalink("/2024/01/my-post/")).toBe("my-post");
    expect(
      deriveDesiredSlug({ permalink: "/blog/hello-world/" }, "post.md")
    ).toBe("hello-world");
  });

  it("derives slug from filename", () => {
    expect(deriveSlugFromFilename("_posts/2024-01-15-my-post.md")).toBe("my-post");
    expect(deriveSlugFromFilename("hello-world.md")).toBe("hello-world");
  });

  it("parses legacy dates", () => {
    expect(parseLegacyDate("2024-01-15")).toEqual(new Date("2024-01-15"));
    expect(parseLegacyDate("invalid")).toBeNull();
  });

  it("normalizes tags and categories", () => {
    expect(normalizeTagOrCategoryList(["DevOps", "devops"])).toEqual(["DevOps"]);
    expect(normalizeTagOrCategoryList("news, release")).toEqual(["news", "release"]);
  });

  it("derives old paths from permalink and jekyll filename", () => {
    const paths = deriveOldPaths({
      relativePath: "_posts/2024-01-15-my-post.md",
      permalink: "/legacy/my-post/",
      slug: "my-post",
      publishedAt: new Date("2024-01-15T00:00:00.000Z"),
    });

    expect(paths).toContain("/legacy/my-post");
    expect(paths).toContain("/2024/01/15/my-post");
    expect(paths).toContain("/my-post");
  });

  it("normalizes redirect paths", () => {
    expect(normalizeUrlPath("legacy/my-post/")).toBe("/legacy/my-post");
  });

  it("rejects path traversal outside source root", () => {
    expect(() => resolveSafePath("/tmp/source", "../outside.md")).toThrow(/escapes source root/);
  });
});
