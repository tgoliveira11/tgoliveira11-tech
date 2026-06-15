import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type { postRevisions, posts, revisionTypeEnum } from "./posts.schema";

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
export type PostRevision = InferSelectModel<typeof postRevisions>;
export type PostStatus = Post["status"];
export type RevisionType = (typeof revisionTypeEnum.enumValues)[number];

export type AdminPostListFilters = {
  status?: PostStatus;
  categoryId?: string;
  featured?: boolean;
  pinned?: boolean;
  search?: string;
  sort?: "updatedAt" | "publishedAt";
  limit?: number;
  offset?: number;
};

export type AdminPostBundle = {
  post: Post;
  category: import("@/modules/categories/categories.types").Category | null;
  tagIds: string[];
};

export type PublishedPostListOptions = {
  limit?: number;
  offset?: number;
};
