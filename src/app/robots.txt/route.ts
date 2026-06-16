import { getBlogConfig } from "@/modules/public/blog-config";
import { buildRobotsTxt } from "@/modules/public/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await getBlogConfig();
  const body = buildRobotsTxt(config);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
