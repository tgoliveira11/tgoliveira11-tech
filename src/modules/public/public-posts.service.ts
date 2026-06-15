import * as repo from "./public-posts.repository";
import { getBlogConfig } from "./blog-config";
import { splitHomePosts } from "./public-display";

export async function getHomePagePosts() {
  const config = await getBlogConfig();
  const bundles = await repo.listPublishedPostBundles({ limit: config.postsPerPage + 5 });
  const { featuredPost, recent } = splitHomePosts(bundles, config.postsPerPage);

  return {
    config,
    featuredPost,
    recent,
  };
}

export async function getBlogListingPage(page: number) {
  const config = await getBlogConfig();
  const pageSize = config.postsPerPage;
  const offset = Math.max(0, (page - 1) * pageSize);
  const [posts, total] = await Promise.all([
    repo.listPublishedPostBundles({ limit: pageSize, offset }),
    repo.countPublishedPosts(),
  ]);

  return {
    config,
    posts,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export {
  getPublishedPostBundleBySlug,
  searchPublishedPostBundles,
  listPublishedPostBundles,
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
} from "./public-posts.repository";

export type { PublicPostBundle } from "./public-posts.repository";
