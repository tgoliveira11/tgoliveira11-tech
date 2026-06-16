import type { MetadataRoute } from "next";
import { getBlogConfig } from "@/modules/public/blog-config";
import { ABOUT_SITEMAP_ENTRY } from "@/modules/public/about-content";
import {
  listPublicCategories,
  listPublicTags,
  listPublishedSlugs,
} from "@/modules/public/public-posts.service";
import { buildSitemapEntries } from "@/modules/public/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const config = await getBlogConfig();
  const [posts, tags, categories] = await Promise.all([
    listPublishedSlugs(),
    listPublicTags(),
    listPublicCategories(),
  ]);

  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const now = new Date();

  return [
    ...buildSitemapEntries({
      config,
      posts,
      tags,
      categories,
    }),
    {
      url: `${baseUrl}${ABOUT_SITEMAP_ENTRY.path}`,
      lastModified: now,
      changeFrequency: ABOUT_SITEMAP_ENTRY.changeFrequency,
      priority: ABOUT_SITEMAP_ENTRY.priority,
    },
  ];
}
