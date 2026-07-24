import { NextResponse } from "next/server";
import { getBlogConfig } from "@/modules/public/blog-config";
import { buildLlmsFullTxt } from "@/modules/public/ai-discovery";
import {
  listPublicCategories,
  listPublicTags,
  listPublishedPostsForFeed,
} from "@/modules/public/public-posts.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const [config, posts, tags, categories] = await Promise.all([
    getBlogConfig(),
    listPublishedPostsForFeed(1000),
    listPublicTags(),
    listPublicCategories(),
  ]);

  return new NextResponse(buildLlmsFullTxt({ config, posts, tags, categories }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

