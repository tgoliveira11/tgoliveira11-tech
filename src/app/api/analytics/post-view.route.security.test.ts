import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/modules/public/blog-config", () => ({
  getBlogConfig: vi.fn(),
}));
vi.mock("@/modules/analytics/analytics.request", () => ({
  extractPostViewRequest: vi.fn(),
}));
vi.mock("@/modules/analytics/rate-limit", () => ({
  isRateLimited: vi.fn(),
}));
vi.mock("@/modules/public/public-posts.service", () => ({
  getPublishedPostBundleBySlug: vi.fn(),
}));
vi.mock("@/modules/posts/posts.repository", () => ({
  findPostById: vi.fn(),
  findPublishedPostBySlug: vi.fn(),
}));
vi.mock("@/modules/analytics/analytics.service", () => ({
  trackPostView: vi.fn(),
}));

import { getBlogConfig } from "@/modules/public/blog-config";
import { extractPostViewRequest } from "@/modules/analytics/analytics.request";
import { isRateLimited } from "@/modules/analytics/rate-limit";
import { getPublishedPostBundleBySlug } from "@/modules/public/public-posts.service";
import * as postsRepo from "@/modules/posts/posts.repository";
import { trackPostView } from "@/modules/analytics/analytics.service";
import * as route from "@/app/api/analytics/post-view/route";
import type { ExtractedPostViewRequest } from "@/modules/analytics/analytics.request";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("post-view analytics route security", () => {
  it("rejects analytics for an unpublished postId (404)", async () => {
    vi.mocked(getBlogConfig).mockResolvedValue({ analyticsEnabled: true });
    vi.mocked(extractPostViewRequest).mockReturnValue({
      sessionHash: "s1",
      referrer: null,
      referrerHost: null,
      userAgentFamily: "UA",
      browserName: "Chrome",
      osName: "macOS",
      deviceType: "desktop",
      country: "US",
      region: null,
      city: null,
      acceptLanguage: "en-US",
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      ipHash: "ip-hash",
      ipAddress: null,
      requestMetadata: {},
    } as unknown as ExtractedPostViewRequest);
    vi.mocked(isRateLimited).mockReturnValue(false);

    vi.mocked(postsRepo.findPostById).mockResolvedValue({ id: "p1", slug: "draft-slug" });
    vi.mocked(postsRepo.findPublishedPostBySlug).mockResolvedValue(undefined);

    const request = new Request("http://localhost/api/analytics/post-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ postId: "550e8400-e29b-41d4-a716-446655440000" }),
    });

    const response = await route.POST(request);
    expect(response.status).toBe(404);
    const payload = (await response.json()) as unknown as { ok: boolean; reason: string };
    expect(payload.ok).toBe(false);
    expect(payload.reason).toBe("not_found");
    expect(trackPostView).not.toHaveBeenCalled();
  });

  it("tracks analytics for a published post (200)", async () => {
    vi.mocked(getBlogConfig).mockResolvedValue({ analyticsEnabled: true });
    vi.mocked(extractPostViewRequest).mockReturnValue({
      sessionHash: "s1",
      requestMetadata: {},
    } as unknown as ExtractedPostViewRequest);
    vi.mocked(isRateLimited).mockReturnValue(false);

    vi.mocked(getPublishedPostBundleBySlug).mockResolvedValue({
      post: { id: "p1", slug: "published-slug" },
    } as unknown as { post: { id: string; slug: string } });

    const request = new Request("http://localhost/api/analytics/post-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: "published-slug" }),
    });

    const response = await route.POST(request);
    expect(response.status).toBe(200);
    const payload = (await response.json()) as unknown as { ok: boolean };
    expect(payload.ok).toBe(true);
    expect(trackPostView).toHaveBeenCalledWith(
      expect.objectContaining({
        postId: "p1",
        requestMetadata: expect.objectContaining({ postSlug: "published-slug" }),
      })
    );
  });
});

