import type { PublicPostBundle } from "./public-posts.repository";
import { getFeaturedInsightRank } from "./editorial-taxonomy";

export const DEFAULT_VISIBLE_TAGS = 4;
export const HOME_TOPICS_TAG_LIMIT = 16;

export function limitTagsForDisplay<T extends { id: string; name: string }>(
  tags: T[],
  limit = DEFAULT_VISIBLE_TAGS
): { visible: T[]; hiddenCount: number } {
  if (tags.length <= limit) {
    return { visible: tags, hiddenCount: 0 };
  }

  return {
    visible: tags.slice(0, limit),
    hiddenCount: tags.length - limit,
  };
}

export function pickFeaturedPost(bundles: PublicPostBundle[]): PublicPostBundle | null {
  if (bundles.length === 0) {
    return null;
  }

  const pinned = bundles.find((bundle) => bundle.post.pinned);
  if (pinned) {
    return pinned;
  }

  const featured = bundles.find((bundle) => bundle.post.featured);
  if (featured) {
    return featured;
  }

  return bundles[0] ?? null;
}

export function getFeaturedPostLabel(bundle: PublicPostBundle): string {
  if (bundle.post.pinned) {
    return "Pinned";
  }
  if (bundle.post.featured) {
    return "Featured";
  }
  return "Latest";
}

export function splitHomePosts(bundles: PublicPostBundle[], pageSize: number) {
  const featuredPost = pickFeaturedPost(bundles);
  const featuredId = featuredPost?.post.id;
  const recent = bundles.filter((bundle) => bundle.post.id !== featuredId).slice(0, pageSize);

  return { featuredPost, recent };
}

export function pickFeaturedInsightPosts(
  bundles: PublicPostBundle[],
  limit = 5
): PublicPostBundle[] {
  const ranked = bundles
    .map((bundle, index) => ({
      bundle,
      rank: getFeaturedInsightRank(bundle.post),
      index,
    }))
    .filter((item) => item.rank !== Number.MAX_SAFE_INTEGER)
    .sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }
      return left.index - right.index;
    });

  const selected = new Map<string, PublicPostBundle>();
  for (const item of ranked) {
    if (!selected.has(item.bundle.post.id)) {
      selected.set(item.bundle.post.id, item.bundle);
    }
    if (selected.size >= limit) {
      break;
    }
  }

  if (selected.size >= limit) {
    return [...selected.values()];
  }

  for (const bundle of bundles) {
    if (!selected.has(bundle.post.id)) {
      selected.set(bundle.post.id, bundle);
    }
    if (selected.size >= limit) {
      break;
    }
  }

  return [...selected.values()];
}

export function splitHomeEditorialSections(
  bundles: PublicPostBundle[],
  pageSize: number,
  featuredLimit = 5
) {
  const featuredInsights = pickFeaturedInsightPosts(bundles, featuredLimit);
  const featuredIds = new Set(featuredInsights.map((bundle) => bundle.post.id));
  const recent = bundles.filter((bundle) => !featuredIds.has(bundle.post.id)).slice(0, pageSize);

  return { featuredInsights, recent };
}

export function formatPublishedPostCount(count: number): string {
  if (count === 1) {
    return "1 published post";
  }
  return `${count} published posts`;
}

export function formatTopicPostCount(count: number): string {
  if (count === 1) {
    return "1 post";
  }
  return `${count} posts`;
}
