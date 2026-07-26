import { NextResponse } from "next/server";
import { getBlogConfig } from "@/modules/public/blog-config";
import { buildLlmsTxt } from "@/modules/public/ai-discovery";
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

  return new NextResponse(buildLlmsTxt({ config, posts, tags, categories }), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
    },
  });
}
