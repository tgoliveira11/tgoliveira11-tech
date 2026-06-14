import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { postTags } from "./posts.schema";
import { tags } from "@/modules/tags/tags.schema";
import type { Tag } from "@/modules/tags/tags.types";

export async function getTagsForPost(postId: string): Promise<Tag[]> {
  const rows = await db
    .select({ tag: tags })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId));

  return rows.map((row) => row.tag);
}

export async function getTagIdsForPost(postId: string): Promise<string[]> {
  const rows = await db
    .select({ tagId: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.postId, postId));

  return rows.map((row) => row.tagId);
}

export async function syncPostTags(postId: string, tagIds: string[]): Promise<void> {
  const uniqueIds = [...new Set(tagIds)];

  if (uniqueIds.length > 0) {
    const existing = await db
      .select({ id: tags.id })
      .from(tags)
      .where(inArray(tags.id, uniqueIds));

    const validIds = new Set(existing.map((row) => row.id));
    const invalid = uniqueIds.filter((id) => !validIds.has(id));
    if (invalid.length > 0) {
      throw new Error("One or more tag IDs are invalid");
    }
  }

  await db.delete(postTags).where(eq(postTags.postId, postId));

  if (uniqueIds.length === 0) {
    return;
  }

  await db.insert(postTags).values(uniqueIds.map((tagId) => ({ postId, tagId })));
}
