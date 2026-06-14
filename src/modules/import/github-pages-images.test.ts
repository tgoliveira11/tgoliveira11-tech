import { describe, expect, it } from "vitest";
import {
  extractMarkdownImageReferences,
  rewriteMarkdownImages,
} from "./github-pages-images";
import { isSafeRelativeImagePath } from "./github-pages.validation";

describe("github-pages images", () => {
  it("detects local and remote markdown images", () => {
    const markdown = "![local](./images/a.png)\n![remote](https://cdn.example.com/b.png)";
    const refs = extractMarkdownImageReferences(markdown);
    expect(refs).toHaveLength(2);
    expect(refs[0]?.isRemote).toBe(false);
    expect(refs[1]?.isRemote).toBe(true);
  });

  it("preserves remote images and rewrites copied local images", () => {
    const markdown = "![local](./images/a.png)";
    const rewritten = rewriteMarkdownImages(markdown, new Map([["./images/a.png", "/api/assets/posts/x/a.png"]]));
    expect(rewritten).toContain("/api/assets/posts/x/a.png");
  });

  it("rejects unsafe relative image paths", () => {
    expect(isSafeRelativeImagePath("../secret.png")).toBe(false);
    expect(isSafeRelativeImagePath("./images/ok.png")).toBe(true);
    expect(isSafeRelativeImagePath("https://example.com/a.png")).toBe(false);
  });
});
