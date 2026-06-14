import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AssetGrid } from "@/components/admin/assets/asset-grid";
import { AssetUploadForm } from "@/components/admin/assets/asset-upload-form";
import { CoverImagePicker } from "@/components/admin/assets/cover-image-picker";
import { OgImagePicker } from "@/components/admin/assets/og-image-picker";
import * as assetsService from "@/modules/assets/assets.service";
import * as postsService from "@/modules/posts/posts.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostAssetsPage({ params }: PageProps) {
  const { id } = await params;

  let post;
  try {
    post = await postsService.getById(id);
  } catch {
    notFound();
  }

  const assets = await assetsService.listAssetsByPost(id);

  return (
    <div>
      <AdminPageTitle
        title="Post Assets"
        description={`Images for “${post.title}”`}
        actions={
          <Link href={`/admin/posts/${id}/edit`} className="rounded-md border border-[var(--border)] px-4 py-2 text-sm">
            Back to edit
          </Link>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <CoverImagePicker postId={id} assets={assets} coverAssetId={post.coverAssetId} />
        <OgImagePicker postId={id} assets={assets} ogAssetId={post.ogAssetId} />
      </div>

      <AssetUploadForm postId={id} />

      <div className="mt-8">
        <AssetGrid
          assets={assets}
          coverAssetId={post.coverAssetId}
          ogAssetId={post.ogAssetId}
        />
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Deleting an image does not rewrite Markdown references automatically. Update post content if needed.
      </p>
    </div>
  );
}
