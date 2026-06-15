import { NextResponse } from "next/server";
import { getBlogConfig } from "@/modules/public/blog-config";
import { buildRssXml } from "@/modules/public/rss";
import { listPublishedPostsForFeed } from "@/modules/public/public-posts.service";

export async function GET() {
  const config = await getBlogConfig();

  if (!config.rssEnabled) {
    return new NextResponse("RSS feed disabled", { status: 404 });
  }

  const bundles = await listPublishedPostsForFeed(50);
  const xml = buildRssXml(config, bundles);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
