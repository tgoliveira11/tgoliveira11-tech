export * from "@/modules/categories/categories.schema";
export * from "@/modules/tags/tags.schema";
export * from "@/modules/posts/posts.schema";
export * from "@/modules/assets/assets.schema";
export * from "@/modules/redirects/redirects.schema";
export * from "@/modules/analytics/analytics.schema";
export * from "@/modules/settings/blog-settings.schema";

import { analyticsEvents, postDailyStats } from "@/modules/analytics/analytics.schema";
import { assets } from "@/modules/assets/assets.schema";
import { categories } from "@/modules/categories/categories.schema";
import { postRevisions, postTags, posts } from "@/modules/posts/posts.schema";
import { redirects } from "@/modules/redirects/redirects.schema";
import { blogSettings } from "@/modules/settings/blog-settings.schema";
import { tags } from "@/modules/tags/tags.schema";

export const blogSchema = {
  categories,
  tags,
  posts,
  postTags,
  postRevisions,
  assets,
  redirects,
  analyticsEvents,
  postDailyStats,
  blogSettings,
};

export type BlogSchema = typeof blogSchema;
