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
  limit?: number;
  offset?: number;
};

export type PublishedPostListOptions = {
  limit?: number;
  offset?: number;
};
