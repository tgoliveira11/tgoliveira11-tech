"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";
import { requireAdminSession } from "@/modules/admin/authorization";
import * as tagsService from "@/modules/tags/tags.service";
import { createTagSchema, updateTagSchema } from "@/modules/tags/tags.validation";

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

function revalidateTagPaths(): void {
  revalidatePath("/admin/tags");
  revalidatePath("/tags");
}

export async function createTagAction(
  _prevState: TaxonomyActionResult,
  formData: FormData
): Promise<TaxonomyActionResult> {
  try {
    await requireAdminSession();
    await tagsService.createTag(
      createTagSchema.parse({
        name: formData.get("name"),
        slug: formData.get("slug") || undefined,
      })
    );
    revalidateTagPaths();
    return { ok: true, message: "Tag created" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function updateTagAction(
  tagId: string,
  _prevState: TaxonomyActionResult,
  formData: FormData
): Promise<TaxonomyActionResult> {
  try {
    await requireAdminSession();
    await tagsService.updateTag(
      tagId,
      updateTagSchema.parse({
        name: formData.get("name") || undefined,
        slug: formData.get("slug") || undefined,
      })
    );
    revalidateTagPaths();
    return { ok: true, message: "Tag updated" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function deleteTagAction(tagId: string): Promise<TaxonomyActionResult> {
  try {
    await requireAdminSession();
    await tagsService.deleteTag(tagId);
    revalidateTagPaths();
    return { ok: true, message: "Tag deleted" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}
