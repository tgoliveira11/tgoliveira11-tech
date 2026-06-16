import { ConflictError, NotFoundError } from "@/lib/errors";
import { isValidSlug, normalizeSlug, slugFromTitle } from "@/modules/posts/slug";
import * as repo from "./categories.repository";
import type { Category } from "./categories.types";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "./categories.validation";

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const parsed = createCategorySchema.parse(input);
  const slug = parsed.slug ?? slugFromTitle(parsed.name);

  if (!isValidSlug(slug)) {
    throw new ConflictError("Invalid category slug");
  }

  if (await repo.findCategoryByNameCaseInsensitive(parsed.name)) {
    throw new ConflictError("Category name already exists");
  }

  if (await repo.findCategoryBySlug(slug)) {
    throw new ConflictError("Category slug already exists");
  }

  return repo.insertCategory({
    name: parsed.name,
    slug,
    description: parsed.description ?? null,
  });
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
  const parsed = updateCategorySchema.parse(input);
  const existing = await repo.findCategoryById(id);

  if (!existing) {
    throw new NotFoundError("Category not found");
  }

  if (parsed.slug) {
    const other = await repo.findCategoryBySlug(parsed.slug);
    if (other && other.id !== id) {
      throw new ConflictError("Category slug already exists");
    }
  }

  const updated = await repo.updateCategoryById(id, {
    name: parsed.name,
    slug: parsed.slug ? normalizeSlug(parsed.slug) : undefined,
    description: parsed.description,
  });

  if (!updated) {
    throw new NotFoundError("Category not found");
  }

  return updated;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const category = await repo.findCategoryBySlug(slug);
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
}

export async function listCategories(): Promise<Category[]> {
  return repo.listCategories();
}

export async function listAdminCategories() {
  return repo.listAdminCategories();
}

export async function getCategoryUsageCount(id: string): Promise<number> {
  return repo.countCategoryUsage(id);
}

export async function deleteCategory(id: string): Promise<void> {
  const usageCount = await repo.countCategoryUsage(id);
  if (usageCount > 0) {
    throw new ConflictError("This category is used by posts and cannot be deleted.");
  }

  const deleted = await repo.deleteCategoryById(id);
  if (!deleted) {
    throw new NotFoundError("Category not found");
  }
}
