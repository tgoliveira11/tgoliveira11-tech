import { describe, expect, it } from "vitest";
import {
  extractMainImageUrl,
  extractSlugFromUrl,
  htmlToMarkdown,
  parseUrlPostHtml,
  resolveUrl,
} from "@/modules/import/url-post-parser";
import * as cheerio from "cheerio";

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="OG Title Fallback">
  <meta property="og:description" content="OG description fallback">
  <meta property="og:image" content="https://cdn.example.com/cover.jpg">
  <title>Document Title</title>
</head>
<body>
  <nav><a href="/">Home</a></nav>
  <article>
    <h1>Deciphering the Differences - Software Architecture, Solution Architecture and System Architecture</h1>
    <h2>Unraveling the Architectural Tapestry - Exploring Software, Solution and System Architecture</h2>
    <p>First paragraph with enough text to serve as a fallback excerpt when subtitle is missing from the page structure.</p>
    <img src="/images/architecture.png" alt="diagram">
    <p>More article content with additional details about architecture patterns.</p>
  </article>
  <footer>Footer content</footer>
</body>
</html>`;

describe("url post parser", () => {
  it("extracts slug from dated path without dropping leading digits", () => {
    expect(
      extractSlugFromUrl(
        "https://www.tgoliveira11.tech/2023-06-16-software-solution-system-architecture/"
      )
    ).toBe("2023-06-16-software-solution-system-architecture");
  });

  it("extracts title, subtitle, slug, and markdown from article HTML", () => {
    const parsed = parseUrlPostHtml({
      html: SAMPLE_HTML,
      finalUrl: "https://www.tgoliveira11.tech/2023-06-16-software-solution-system-architecture/",
    });

    expect(parsed.title).toBe(
      "Deciphering the Differences - Software Architecture, Solution Architecture and System Architecture"
    );
    expect(parsed.excerpt).toBe(
      "Unraveling the Architectural Tapestry - Exploring Software, Solution and System Architecture"
    );
    expect(parsed.slug).toBe("2023-06-16-software-solution-system-architecture");
    expect(parsed.contentMarkdown).toContain("More article content");
    expect(parsed.contentMarkdown).not.toContain("Footer content");
    expect(parsed.mainImageUrl).toBe("https://cdn.example.com/cover.jpg");
  });

  it("falls back to og:title and meta description when article headings are missing", () => {
    const html = `<html><head>
      <meta property="og:title" content="OG Title">
      <meta name="description" content="Meta description">
    </head><body><main><p>${"Long fallback paragraph. ".repeat(8)}</p></main></body></html>`;

    const parsed = parseUrlPostHtml({
      html,
      finalUrl: "https://example.com/my-post/",
    });

    expect(parsed.title).toBe("OG Title");
    expect(parsed.excerpt).toBe("Meta description");
  });

  it("resolves relative image URLs against the page URL", () => {
    const $ = cheerio.load(`<article><img src="/images/architecture.png"></article>`);
    const article = $("article");
    const image = extractMainImageUrl($, article, "https://example.com/posts/test/", []);
    expect(image).toBe("https://example.com/images/architecture.png");
  });

  it("picks first article image when og:image is missing", () => {
    const html = `<html><body><article><img src="https://example.com/inline.png"><p>${"Body ".repeat(20)}</p></article></body></html>`;
    const parsed = parseUrlPostHtml({
      html,
      finalUrl: "https://example.com/post/",
    });
    expect(parsed.mainImageUrl).toBe("https://example.com/inline.png");
  });

  it("converts article HTML to Markdown", () => {
    const markdown = htmlToMarkdown("<h2>Heading</h2><p>Paragraph with <strong>bold</strong>.</p>");
    expect(markdown).toContain("## Heading");
    expect(markdown).toContain("**bold**");
  });

  it("resolves relative URLs", () => {
    expect(resolveUrl("https://example.com/a/b/", "../images/x.png")).toBe(
      "https://example.com/a/images/x.png"
    );
  });
});
