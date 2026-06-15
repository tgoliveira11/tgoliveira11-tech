import { NextResponse } from "next/server";
import { z } from "zod";
import { trackPostView } from "@/modules/analytics/analytics.service";
import { getAnalyticsClientKey, isRateLimited } from "@/modules/analytics/rate-limit";
import { getBlogConfig } from "@/modules/public/blog-config";
import { getPublishedPostBundleBySlug } from "@/modules/public/public-posts.service";
import * as postsRepo from "@/modules/posts/posts.repository";

const bodySchema = z
  .object({
    slug: z.string().min(1).optional(),
    postId: z.string().uuid().optional(),
  })
  .refine((value) => value.slug || value.postId, {
    message: "slug or postId is required",
  });

function detectDeviceType(userAgent: string | null): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes("mobile")) return "mobile";
  if (ua.includes("tablet")) return "tablet";
  return "desktop";
}

export async function POST(request: Request) {
  const config = await getBlogConfig();
  if (!config.analyticsEnabled) {
    return NextResponse.json({ ok: false, reason: "disabled" }, { status: 404 });
  }

  const clientKey = getAnalyticsClientKey(request);
  if (isRateLimited(clientKey)) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "invalid_input" }, { status: 400 });
  }

  let postId: string | undefined;

  if (parsed.data.slug) {
    const bundle = await getPublishedPostBundleBySlug(parsed.data.slug);
    if (!bundle) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }
    postId = bundle.post.id;
  } else if (parsed.data.postId) {
    const post = await postsRepo.findPostById(parsed.data.postId);
    if (!post) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }
    const published = await postsRepo.findPublishedPostBySlug(post.slug);
    if (!published || published.id !== post.id) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }
    postId = published.id;
  }

  if (!postId) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  const country = request.headers.get("x-vercel-ip-country");

  try {
    await trackPostView({
      postId,
      referrer,
      userAgentFamily: userAgent?.split(" ")[0] ?? null,
      deviceType: detectDeviceType(userAgent),
      country,
      sessionHash: clientKey,
    });
  } catch {
    return NextResponse.json({ ok: false, reason: "track_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
