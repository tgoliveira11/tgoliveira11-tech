"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";
import { requireAdminSession } from "@/modules/admin/authorization";
import * as categoriesService from "@/modules/categories/categories.service";
import { createCategorySchema, updateCategorySchema } from "@/modules/categories/categories.validation";

export type TaxonomyActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

function mapActionError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

function revalidateCategoryPaths(): void {
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
}

export async function createCategoryAction(
  _prevState: TaxonomyActionResult,
  formData: FormData
): Promise<TaxonomyActionResult> {
  try {
    await requireAdminSession();
    await categoriesService.createCategory(
      createCategorySchema.parse({
        name: formData.get("name"),
        slug: formData.get("slug") || undefined,
        description: formData.get("description") || undefined,
      })
    );
    revalidateCategoryPaths();
    return { ok: true, message: "Category created" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: TaxonomyActionResult,
  formData: FormData
): Promise<TaxonomyActionResult> {
  try {
    await requireAdminSession();
    await categoriesService.updateCategory(
      categoryId,
      updateCategorySchema.parse({
        name: formData.get("name") || undefined,
        slug: formData.get("slug") || undefined,
        description: formData.has("description")
          ? String(formData.get("description") ?? "")
          : undefined,
      })
    );
    revalidateCategoryPaths();
    return { ok: true, message: "Category updated" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function deleteCategoryAction(categoryId: string): Promise<TaxonomyActionResult> {
  try {
    await requireAdminSession();
    await categoriesService.deleteCategory(categoryId);
    revalidateCategoryPaths();
    return { ok: true, message: "Category deleted" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}
