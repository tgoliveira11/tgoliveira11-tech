import type { MetadataRoute } from "next";
import { getBlogConfig } from "@/modules/public/blog-config";
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

  return buildSitemapEntries({
    config,
    posts,
    tags,
    categories,
  });
}
