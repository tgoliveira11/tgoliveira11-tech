import type { BlogConfig } from "./blog-config";
import type { PublicPostBundle } from "./public-posts.repository";
import { publicPostPath } from "@/modules/posts/slug";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildRssXml(config: BlogConfig, bundles: PublicPostBundle[]): string {
  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const items = bundles
    .map((bundle) => {
      const link = `${baseUrl}${publicPostPath(bundle.post.slug)}`;
      const description = bundle.post.excerpt ?? "";
      const categories = [
        bundle.category ? `<category>${escapeXml(bundle.category.name)}</category>` : "",
        ...bundle.tags.map((tag) => `<category>${escapeXml(tag.name)}</category>`),
      ].join("");

      return `<item>
  <title>${escapeXml(bundle.post.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <pubDate>${bundle.post.publishedAt?.toUTCString() ?? ""}</pubDate>
  <description>${escapeXml(description)}</description>
  ${categories}
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`;
}
