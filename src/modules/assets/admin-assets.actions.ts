"use server";

import { revalidatePath } from "next/cache";
import { AppError } from "@/lib/errors";
import { requireAdminSession } from "@/modules/admin/authorization";
import { revalidatePublicPaths } from "@/modules/admin/revalidate-public";
import * as assetsService from "@/modules/assets/assets.service";
import * as postsService from "@/modules/posts/posts.service";
import { updateAssetMetadataSchema } from "@/modules/assets/assets.validation";

export type AssetActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

function mapActionError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function updateAssetMetadataAction(
  assetId: string,
  _prevState: AssetActionResult,
  formData: FormData
): Promise<AssetActionResult> {
  try {
    await requireAdminSession();
    const input = updateAssetMetadataSchema.parse({
      altText: formData.has("altText")
        ? String(formData.get("altText") ?? "") || null
        : undefined,
      caption: formData.has("caption")
        ? String(formData.get("caption") ?? "") || null
        : undefined,
    });

    const asset = await assetsService.updateAssetMetadata(assetId, input);
    revalidatePath(`/admin/posts/${asset.postId}/assets`);
    revalidatePath(`/admin/posts/${asset.postId}/edit`);
    return { ok: true, message: "Asset updated" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function deleteAssetAction(assetId: string): Promise<AssetActionResult> {
  try {
    const session = await requireAdminSession();
    const asset = await assetsService.getAssetById(assetId);
    await assetsService.deletePostAsset(assetId, session.user.id);
    revalidatePath(`/admin/posts/${asset.postId}/assets`);
    revalidatePath(`/admin/posts/${asset.postId}/edit`);
    revalidatePublicPaths();
    return { ok: true, message: "Asset deleted" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function setPostCoverAssetAction(
  postId: string,
  assetId: string | null
): Promise<AssetActionResult> {
  try {
    const session = await requireAdminSession();
    await assetsService.setPostCoverAsset(postId, assetId, session.user.id);
    const post = await postsService.getById(postId);
    revalidatePath(`/admin/posts/${postId}/edit`);
    revalidatePublicPaths(post.slug);
    return { ok: true, message: assetId ? "Cover image set" : "Cover image cleared" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}

export async function setPostOgAssetAction(
  postId: string,
  assetId: string | null
): Promise<AssetActionResult> {
  try {
    const session = await requireAdminSession();
    await assetsService.setPostOgAsset(postId, assetId, session.user.id);
    const post = await postsService.getById(postId);
    revalidatePath(`/admin/posts/${postId}/edit`);
    revalidatePublicPaths(post.slug);
    return { ok: true, message: assetId ? "OG image set" : "OG image cleared" };
  } catch (error) {
    return { ok: false, error: mapActionError(error) };
  }
}
