import * as repo from "./public-posts.repository";
import { getBlogConfig } from "./blog-config";
import { readPublicPostsPageSize } from "@/lib/env";
import { normalizePage } from "@/lib/pagination";
import { splitHomePosts } from "./public-display";

export async function getHomePagePosts() {
  const config = await getBlogConfig();
  const bundles = await repo.listPublishedPostBundles({
    limit: config.postsPerPage + 5,
  });
  const { featuredPost, recent } = splitHomePosts(bundles, config.postsPerPage);

  return {
    config,
    featuredPost,
    recent,
  };
}

export async function getBlogListingPage(page: number) {
  const config = await getBlogConfig();
  const pageSize = readPublicPostsPageSize();
  const normalizedPage = normalizePage(page);
  const paginated = await repo.listPublishedPostBundlesPaginated({
    page: normalizedPage,
    pageSize,
  });

  return {
    config,
    posts: paginated.items,
    page: paginated.page,
    pageSize: paginated.pageSize,
    total: paginated.totalItems,
    totalPages: paginated.totalPages,
    hasPreviousPage: paginated.hasPreviousPage,
    hasNextPage: paginated.hasNextPage,
  };
}

export {
  getPublishedPostBundleBySlug,
  searchPublishedPostBundles,
  listPublishedPostBundles,
  listPublishedPostBundlesPaginated,
  listPublishedPostBundlesByCategorySlug,
  listPublishedPostBundlesByTagSlug,
  listPublicTags,
  listPublicCategories,
  listAllTags,
  listAllCategories,
  getPublishedNeighbors,
  listPublishedPostsForFeed,
  listPublishedSlugs,
  countPublishedPosts,
  listPublishedPostsWithPublicOrder,
} from "./public-posts.repository";

export type { PublicPostBundle, PaginatedResult } from "./public-posts.repository";
