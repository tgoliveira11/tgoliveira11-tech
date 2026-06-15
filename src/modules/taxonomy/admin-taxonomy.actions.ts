"use server";

import { AppError } from "@/lib/errors";
import { requireAdminSession } from "@/modules/admin/authorization";
import type { Category } from "@/modules/categories/categories.types";
import * as taxonomyService from "@/modules/taxonomy/taxonomy.service";
import type { Tag } from "@/modules/tags/tags.types";

type TaxonomyActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function mapActionError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function searchTagsAction(query: string): Promise<TaxonomyActionResult<{ tags: Tag[] }>> {
  try {
    await requireAdminSession();
    const tags = await taxonomyService.searchTags(query);
    return { ok: true, data: { tags } };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function createOrFindTagAction(
  name: string
): Promise<TaxonomyActionResult<{ tag: Tag; created: boolean }>> {
  try {
    await requireAdminSession();
    const result = await taxonomyService.findOrCreateTag(name);
    return { ok: true, data: { tag: result.item, created: result.created } };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function searchCategoriesAction(
  query: string
): Promise<TaxonomyActionResult<{ categories: Category[] }>> {
  try {
    await requireAdminSession();
    const categories = await taxonomyService.searchCategories(query);
    return { ok: true, data: { categories } };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function createOrFindCategoryAction(
  name: string
): Promise<TaxonomyActionResult<{ category: Category; created: boolean }>> {
  try {
    await requireAdminSession();
    const result = await taxonomyService.findOrCreateCategory(name);
    return { ok: true, data: { category: result.item, created: result.created } };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}
