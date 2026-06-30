import { describe, expect, it, vi } from "vitest";

vi.mock("@/modules/markdown/markdown-renderer", () => ({
  renderMarkdownToHtml: vi.fn(async (markdown: string) => `<p>${markdown}</p>`),
}));

import { renderMarkdownToHtml } from "@/modules/markdown/markdown-renderer";
import { getPostHtmlContent } from "./post-content";

describe("getPostHtmlContent", () => {
  it("returns cached html when present", async () => {
    const html = await getPostHtmlContent({
      contentHtmlCache: "<p>cached</p>",
      contentMarkdown: "# Title",
    } as never);

    expect(html).toBe("<p>cached</p>");
    expect(renderMarkdownToHtml).not.toHaveBeenCalled();
  });

  it("renders markdown when cache is empty", async () => {
    const html = await getPostHtmlContent({
      contentHtmlCache: "   ",
      contentMarkdown: "Hello",
    } as never);

    expect(html).toBe("<p>Hello</p>");
    expect(renderMarkdownToHtml).toHaveBeenCalledWith("Hello");
  });
});
