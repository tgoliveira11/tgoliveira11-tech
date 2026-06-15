import { ConflictError, ValidationError } from "@/lib/errors";
import * as categoriesRepo from "@/modules/categories/categories.repository";
import * as categoriesService from "@/modules/categories/categories.service";
import type { Category } from "@/modules/categories/categories.types";
import { slugFromTitle } from "@/modules/posts/slug";
import * as tagsRepo from "@/modules/tags/tags.repository";
import * as tagsService from "@/modules/tags/tags.service";
import type { Tag } from "@/modules/tags/tags.types";
import { isValidTaxonomyName, normalizeTaxonomyName } from "./taxonomy-name";
import { taxonomyNameSchema, taxonomyQuerySchema } from "./taxonomy.validation";

export type FindOrCreateResult<T> = {
  item: T;
  created: boolean;
};

function parseTaxonomyName(rawName: string): string {
  const parsed = taxonomyNameSchema.safeParse(rawName);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid name");
  }
  return parsed.data;
}

export async function searchTags(query: string): Promise<Tag[]> {
  const parsed = taxonomyQuerySchema.safeParse(query);
  if (!parsed.success || !parsed.data) {
    return [];
  }
  return tagsRepo.searchTagsByName(parsed.data);
}

export async function searchCategories(query: string): Promise<Category[]> {
  const parsed = taxonomyQuerySchema.safeParse(query);
  if (!parsed.success || !parsed.data) {
    return [];
  }
  return categoriesRepo.searchCategoriesByName(parsed.data);
}

export async function findOrCreateTag(rawName: string): Promise<FindOrCreateResult<Tag>> {
  const name = parseTaxonomyName(rawName);
  const slug = slugFromTitle(name);

  const bySlug = await tagsRepo.findTagBySlug(slug);
  if (bySlug) {
    return { item: bySlug, created: false };
  }

  const byName = await tagsRepo.findTagByNameCaseInsensitive(name);
  if (byName) {
    return { item: byName, created: false };
  }

  try {
    const created = await tagsService.createTag({ name });
    return { item: created, created: true };
  } catch (error) {
    if (error instanceof ConflictError) {
      const fallback = await tagsRepo.findTagBySlug(slug);
      if (fallback) {
        return { item: fallback, created: false };
      }
    }
    throw error;
  }
}

export async function findOrCreateCategory(rawName: string): Promise<FindOrCreateResult<Category>> {
  const name = parseTaxonomyName(rawName);
  const slug = slugFromTitle(name);

  const bySlug = await categoriesRepo.findCategoryBySlug(slug);
  if (bySlug) {
    return { item: bySlug, created: false };
  }

  const byName = await categoriesRepo.findCategoryByNameCaseInsensitive(name);
  if (byName) {
    return { item: byName, created: false };
  }

  try {
    const created = await categoriesService.createCategory({ name });
    return { item: created, created: true };
  } catch (error) {
    if (error instanceof ConflictError) {
      const fallback = await categoriesRepo.findCategoryBySlug(slug);
      if (fallback) {
        return { item: fallback, created: false };
      }
    }
    throw error;
  }
}

/** @internal for tests */
export function normalizeTaxonomyInput(rawName: string): string {
  const normalized = normalizeTaxonomyName(rawName);
  if (!isValidTaxonomyName(normalized)) {
    throw new ValidationError("Name must be between 1 and 120 characters");
  }
  return normalized;
}
