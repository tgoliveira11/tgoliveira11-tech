import { NotFoundError } from "@/lib/errors";
import * as postsRepo from "@/modules/posts/posts.repository";
import * as repo from "./analytics.repository";
import type { PostAnalyticsSummary, TrackPostViewInput } from "./analytics.types";

export async function trackPostView(input: TrackPostViewInput): Promise<void> {
  const post = await postsRepo.findPostById(input.postId);
  if (!post) {
    throw new NotFoundError("Post not found");
  }

  const published = await postsRepo.findPublishedPostBySlug(post.slug);
  if (!published || published.id !== post.id) {
    throw new NotFoundError("Published post not found");
  }

  await repo.trackPostViewEvent(input);
}

export async function getPostAnalyticsSummary(postId: string): Promise<PostAnalyticsSummary> {
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const last7 = new Date(startOfToday);
  last7.setUTCDate(last7.getUTCDate() - 6);
  const last30 = new Date(startOfToday);
  last30.setUTCDate(last30.getUTCDate() - 29);

  const [totalViews, viewsToday, viewsLast7Days, viewsLast30Days] = await Promise.all([
    repo.sumAllViews(postId),
    repo.sumViewsSince(postId, startOfToday),
    repo.sumViewsSince(postId, last7),
    repo.sumViewsSince(postId, last30),
  ]);

  return {
    totalViews,
    viewsToday,
    viewsLast7Days,
    viewsLast30Days,
  };
}
