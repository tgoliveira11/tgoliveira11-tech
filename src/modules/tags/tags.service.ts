import { ConflictError, NotFoundError } from "@/lib/errors";
import { isValidSlug, normalizeSlug, slugFromTitle } from "@/modules/posts/slug";
import * as repo from "./tags.repository";
import type { Tag } from "./tags.types";
import {
  createTagSchema,
  updateTagSchema,
  type CreateTagInput,
  type UpdateTagInput,
} from "./tags.validation";

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const parsed = createTagSchema.parse(input);
  const slug = parsed.slug ?? slugFromTitle(parsed.name);

  if (!isValidSlug(slug)) {
    throw new ConflictError("Invalid tag slug");
  }

  if (await repo.findTagByNameCaseInsensitive(parsed.name)) {
    throw new ConflictError("Tag name already exists");
  }

  if (await repo.findTagBySlug(slug)) {
    throw new ConflictError("Tag slug already exists");
  }

  return repo.insertTag({ name: parsed.name, slug });
}

export async function updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
  const parsed = updateTagSchema.parse(input);
  const existing = await repo.findTagById(id);

  if (!existing) {
    throw new NotFoundError("Tag not found");
  }

  if (parsed.slug) {
    const other = await repo.findTagBySlug(parsed.slug);
    if (other && other.id !== id) {
      throw new ConflictError("Tag slug already exists");
    }
  }

  const updated = await repo.updateTagById(id, {
    name: parsed.name,
    slug: parsed.slug ? normalizeSlug(parsed.slug) : undefined,
  });

  if (!updated) {
    throw new NotFoundError("Tag not found");
  }

  return updated;
}

export async function getTagBySlug(slug: string): Promise<Tag> {
  const tag = await repo.findTagBySlug(slug);
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }
  return tag;
}

export async function listTags(): Promise<Tag[]> {
  return repo.listTags();
}

export async function listAdminTags() {
  return repo.listAdminTags();
}

export async function getTagUsageCount(id: string): Promise<number> {
  return repo.countTagUsage(id);
}

export async function deleteTag(id: string): Promise<void> {
  const usageCount = await repo.countTagUsage(id);
  if (usageCount > 0) {
    throw new ConflictError("This tag is used by posts and cannot be deleted.");
  }

  const deleted = await repo.deleteTagById(id);
  if (!deleted) {
    throw new NotFoundError("Tag not found");
  }
}
