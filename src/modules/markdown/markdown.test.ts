import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml } from "@/modules/markdown/markdown-renderer";

describe("markdown rendering", () => {
  it("renders basic markdown elements", async () => {
    const html = await renderMarkdownToHtml("# Heading\n\n**bold** and `code`");
    expect(html).toContain("<h1");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<code>code</code>");
  });

  it("does not pass through raw script tags from markdown", async () => {
    const html = await renderMarkdownToHtml('<script>alert("xss")</script>\n\nHello');
    expect(html).toContain("Hello");
    expect(html).not.toContain("<script");
  });
});
