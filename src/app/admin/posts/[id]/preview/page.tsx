import { notFound } from "next/navigation";
import { PostPreviewFrame } from "@/components/admin/posts/post-preview-frame";
import { PostImage } from "@/components/public/post-image";
import * as assetsService from "@/modules/assets/assets.service";
import { getPostHtmlContent } from "@/modules/public/post-content";
import * as postsService from "@/modules/posts/posts.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(value: Date | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export default async function AdminPostPreviewPage({ params }: PageProps) {
  const { id } = await params;

  let bundle;
  try {
    bundle = await postsService.getAdminPostBundle(id);
  } catch {
    notFound();
  }

  const html = await getPostHtmlContent(bundle.post);
  const coverAsset = bundle.post.coverAssetId
    ? await assetsService
        .getAssetById(bundle.post.coverAssetId)
        .catch(() => null)
    : null;

  return (
    <PostPreviewFrame title={bundle.post.title} editHref={`/admin/posts/${id}/edit`}>
      {bundle.post.excerpt ? <p className="mt-4 text-lg text-[var(--muted)]">{bundle.post.excerpt}</p> : null}
      {coverAsset ? (
        <PostImage
          src={coverAsset.publicUrl}
          alt={coverAsset.altText ?? bundle.post.title}
          width={coverAsset.width}
          height={coverAsset.height}
          className="mt-6 max-h-96 w-full rounded-lg object-cover"
        />
      ) : null}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        <span>Status: {bundle.post.status}</span>
        {bundle.post.publishedAt ? <span>Published: {formatDate(bundle.post.publishedAt)}</span> : null}
        {bundle.post.scheduledAt ? <span>Scheduled: {formatDate(bundle.post.scheduledAt)}</span> : null}
        {bundle.post.readingTimeMinutes ? <span>{bundle.post.readingTimeMinutes} min read</span> : null}
      </div>
      <div className="prose mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    </PostPreviewFrame>
  );
}
