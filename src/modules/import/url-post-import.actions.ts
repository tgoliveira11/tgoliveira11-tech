"use server";

import { redirect } from "next/navigation";
import { AppError } from "@/lib/errors";
import { requireAdminSession } from "@/modules/admin/authorization";
import { importPostFromUrl } from "@/modules/import/url-post-importer";
import { importFromUrlSchema } from "@/modules/import/url-post-importer.validation";
import { UrlFetchSecurityError } from "@/modules/import/url-fetch";

export type ImportFromUrlActionResult = {
  ok: boolean;
  error?: string;
};

function mapImportError(error: unknown): string {
  if (error instanceof UrlFetchSecurityError) {
    return error.message;
  }
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Could not import post from URL";
}

export async function importFromUrlAction(
  _prevState: ImportFromUrlActionResult,
  formData: FormData
): Promise<ImportFromUrlActionResult> {
  try {
    const session = await requireAdminSession();
    const parsed = importFromUrlSchema.parse({
      url: formData.get("url"),
      createRedirect: formData.get("createRedirect") === "on",
    });

    const result = await importPostFromUrl({
      url: parsed.url,
      createRedirect: parsed.createRedirect,
      userId: session.user.id,
    });

    redirect(`/admin/posts/${result.postId}/edit?imported=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { ok: false, error: mapImportError(error) };
  }
}

function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}
