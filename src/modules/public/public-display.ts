import type { PublicPostBundle } from "./public-posts.repository";

export const DEFAULT_VISIBLE_TAGS = 4;
export const HOME_TOPICS_TAG_LIMIT = 16;
export const HOME_TOPICS_CATEGORY_LIMIT = 6;

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
