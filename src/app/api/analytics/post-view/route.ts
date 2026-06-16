import { NextResponse } from "next/server";
import { z } from "zod";
import { extractPostViewRequest } from "@/modules/analytics/analytics.request";
import { trackPostView } from "@/modules/analytics/analytics.service";
import { isRateLimited } from "@/modules/analytics/rate-limit";
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

export async function POST(request: Request) {
  const config = await getBlogConfig();
  if (!config.analyticsEnabled) {
    return NextResponse.json({ ok: false, reason: "disabled" }, { status: 404 });
  }

  const requestContext = extractPostViewRequest(request);
  if (isRateLimited(requestContext.sessionHash)) {
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
  let postSlug: string | null = parsed.data.slug ?? null;

  if (parsed.data.slug) {
    const bundle = await getPublishedPostBundleBySlug(parsed.data.slug);
    if (!bundle) {
      return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
    }
    postId = bundle.post.id;
    postSlug = bundle.post.slug;
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
    postSlug = published.slug;
  }

  if (!postId) {
    return NextResponse.json({ ok: false, reason: "not_found" }, { status: 404 });
  }

  try {
    await trackPostView({
      postId,
      ...requestContext,
      requestMetadata: {
        ...requestContext.requestMetadata,
        postSlug,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, reason: "track_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
