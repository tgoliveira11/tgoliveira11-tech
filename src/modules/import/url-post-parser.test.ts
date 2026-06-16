import { describe, expect, it } from "vitest";
import {
  extractArticleMainImage,
  extractMainImageUrl,
  extractSlugFromUrl,
  findImageAfterPostDate,
  htmlToMarkdown,
  isElementBeforeInDocument,
  parseUrlPostHtml,
  resolveUrl,
} from "@/modules/import/url-post-parser";
import * as cheerio from "cheerio";

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="OG Title Fallback">
  <meta property="og:description" content="OG description fallback">
  <meta property="og:image" content="https://cdn.example.com/social-cover.jpg">
  <title>Document Title</title>
</head>
<body>
  <nav><a href="/">Home</a></nav>
  <article>
    <h1>Deciphering the Differences - Software Architecture, Solution Architecture and System Architecture</h1>
    <h2>Unraveling the Architectural Tapestry - Exploring Software, Solution and System Architecture</h2>
    <p class="post-meta">Posted on June 16, 2023</p>
    <p><img src="/images/hero-below-date.png" alt="diagram"></p>
    <p>First paragraph with enough text to serve as a fallback excerpt when subtitle is missing from the page structure.</p>
    <img src="/images/later-inline.png" alt="later diagram">
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
    expect(parsed.mainImageUrl).toBe(
      "https://www.tgoliveira11.tech/images/hero-below-date.png"
    );
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

describe("article main image selection", () => {
  it("prefers image below post date over og:image", () => {
    const html = `<html><head>
      <meta property="og:image" content="https://cdn.example.com/generic-social.png">
    </head><body><article>
      <h1>Deciphering the Differences...</h1>
      <h2>Subtitle text</h2>
      <p class="post-meta">Posted on June 16, 2023</p>
      <p><img src="https://example.com/hero-below-date.png" alt="hero"></p>
      <p>${"Article body text. ".repeat(20)}</p>
    </article></body></html>`;

    const parsed = parseUrlPostHtml({
      html,
      finalUrl: "https://example.com/post/",
    });

    expect(parsed.mainImageUrl).toBe("https://example.com/hero-below-date.png");
    expect(parsed.mainImageUrl).not.toBe("https://cdn.example.com/generic-social.png");
  });

  it("selects image following a time element", () => {
    const html = `<article>
      <h1>Title</h1>
      <time datetime="2023-06-16">June 16, 2023</time>
      <p><img src="/images/time-adjacent.png" alt="diagram"></p>
      <p>${"Body ".repeat(20)}</p>
    </article>`;

    const $ = cheerio.load(html);
    const image = findImageAfterPostDate($, $("article"), "https://example.com/post/");
    expect(image).toBe("https://example.com/images/time-adjacent.png");
  });

  it("falls back to first article image when no date-adjacent image exists", () => {
    const html = `<html><head>
      <meta property="og:image" content="https://cdn.example.com/og-only.png">
    </head><body><article>
      <h1>Title</h1>
      <p>${"Body ".repeat(20)}</p>
      <img src="https://example.com/article-inline.png" alt="inline">
    </article></body></html>`;

    const parsed = parseUrlPostHtml({
      html,
      finalUrl: "https://example.com/post/",
    });

    expect(parsed.mainImageUrl).toBe("https://example.com/article-inline.png");
  });

  it("falls back to og:image when no article image exists", () => {
    const html = `<html><head>
      <meta property="og:image" content="https://cdn.example.com/og-only.png">
    </head><body><article>
      <h1>Title</h1>
      <p class="post-meta">Posted on June 16, 2023</p>
      <p>${"Body without images. ".repeat(20)}</p>
    </article></body></html>`;

    const parsed = parseUrlPostHtml({
      html,
      finalUrl: "https://example.com/post/",
    });

    expect(parsed.mainImageUrl).toBe("https://cdn.example.com/og-only.png");
  });

  it("resolves relative image URL after post date", () => {
    const html = `<article>
      <p class="post-meta">Posted on June 16, 2023</p>
      <p><img src="../assets/hero.png" alt="hero"></p>
      <p>${"Body ".repeat(20)}</p>
    </article>`;

    const $ = cheerio.load(html);
    const image = extractArticleMainImage($, $("article"), "https://example.com/blog/post/", []);
    expect(image).toBe("https://example.com/blog/assets/hero.png");
  });

  it("skips logo/avatar/icon after date and uses next meaningful image", () => {
    const html = `<article>
      <p class="post-meta">Posted on June 16, 2023</p>
      <p><img src="/images/site-logo.png" alt="Site logo" class="logo"></p>
      <p><img src="/images/hero-after-logo.png" alt="hero"></p>
      <p>${"Body ".repeat(20)}</p>
    </article>`;

    const $ = cheerio.load(html);
    const image = findImageAfterPostDate($, $("article"), "https://example.com/post/");
    expect(image).toBe("https://example.com/images/hero-after-logo.png");
  });

  it("supports picture/source lazy-loaded images after post date", () => {
    const html = `<article>
      <p class="post-meta">Posted on June 16, 2023</p>
      <picture>
        <source srcset="https://example.com/hero-800w.png 800w, https://example.com/hero-1200w.png 1200w">
        <img data-src="https://example.com/hero-fallback.png" alt="hero">
      </picture>
      <p>${"Body ".repeat(20)}</p>
    </article>`;

    const $ = cheerio.load(html);
    const image = findImageAfterPostDate($, $("article"), "https://example.com/post/");
    expect(image).toBe("https://example.com/hero-1200w.png");
  });

  it("selects article image when post date is in page header outside article", () => {
    const html = `<html><head>
      <meta property="og:image" content="https://cdn.example.com/profile.jpg">
    </head><body>
      <header>
        <div class="post-heading">
          <h1>Deciphering the Differences...</h1>
          <h2 class="post-subheading">Subtitle text</h2>
          <span class="post-meta">Posted on June 16, 2023</span>
        </div>
      </header>
      <div class="container-md">
        <article role="main">
          <img src="../assets/img/posts/hero.jpeg" alt="hero">
          <p>${"Article body text. ".repeat(20)}</p>
        </article>
      </div>
    </body></html>`;

    const parsed = parseUrlPostHtml({
      html,
      finalUrl: "https://www.tgoliveira11.tech/2023-06-16-software-solution-system-architecture/",
    });

    expect(parsed.mainImageUrl).toBe(
      "https://www.tgoliveira11.tech/assets/img/posts/hero.jpeg"
    );
    expect(parsed.mainImageUrl).not.toBe("https://cdn.example.com/profile.jpg");
    expect(parsed.warnings).toContain("Main image extracted from image below post date/metadata");
  });

  it("returns false for document-order checks with non-element nodes", () => {
    const $ = cheerio.load("<body><span class=\"post-meta\">Posted on June 16, 2023</span><article><p>Body</p></article></body>");
    const documentNode = $.root().get(0);
    const dateNode = $("span.post-meta").get(0);
    const articleNode = $("article").get(0);

    expect(documentNode).toBeDefined();
    expect(dateNode).toBeDefined();
    expect(articleNode).toBeDefined();

    expect(isElementBeforeInDocument($, documentNode!, articleNode!)).toBe(false);
    expect(isElementBeforeInDocument($, dateNode!, articleNode!)).toBe(true);
  });
});
