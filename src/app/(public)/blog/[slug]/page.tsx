import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { PublicLayout } from "@/components/public/public-layout";
import { PostViewTracker } from "@/components/public/post-view-tracker";
import { getBlogConfig } from "@/modules/public/blog-config";
import { getPostHtmlContent } from "@/modules/public/post-content";
import {
  getPublishedNeighbors,
  getPublishedPostBundleBySlug,
} from "@/modules/public/public-posts.service";
import {
  buildBlogPostingJsonLd,
  buildPostMetadata,
  resolvePostSeoWithImages,
} from "@/modules/public/seo";
import { publicPostPath } from "@/modules/posts/slug";
import * as redirectsRepo from "@/modules/redirects/redirects.repository";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getPublishedPostBundleBySlug(slug);
  if (!bundle) return { title: "Post not found" };

  const config = await getBlogConfig();
  const seo = await resolvePostSeoWithImages({ bundle, config });
  return buildPostMetadata(seo);
}

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getPublishedPostBundleBySlug(slug);

  if (!bundle) {
    const redirect = await redirectsRepo.findRedirectBySourcePath(publicPostPath(slug));
    if (redirect) {
      permanentRedirect(redirect.targetPath);
    }
    notFound();
  }

  const config = await getBlogConfig();
  const [html, neighbors, seo] = await Promise.all([
    getPostHtmlContent(bundle.post),
    getPublishedNeighbors(bundle.post.publishedAt!, bundle.post.id),
    resolvePostSeoWithImages({ bundle, config }),
  ]);

  const jsonLd = buildBlogPostingJsonLd(bundle, seo);

  return (
    <PublicLayout config={config}>
      <PostViewTracker slug={bundle.post.slug} />
      <article>
        <header className="space-y-4">
          <p className="text-sm text-[var(--muted)]">
            {bundle.post.publishedAt ? (
              <time dateTime={bundle.post.publishedAt.toISOString()}>
                Published {formatDate(bundle.post.publishedAt)}
              </time>
            ) : null}
            {bundle.post.readingTimeMinutes ? (
              <span>{bundle.post.publishedAt ? " · " : ""}{bundle.post.readingTimeMinutes} min read</span>
            ) : null}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">{bundle.post.title}</h1>
          {bundle.post.excerpt ? (
            <p className="text-lg text-[var(--muted)]">{bundle.post.excerpt}</p>
          ) : null}
          {bundle.coverAsset ? (
            <img
              src={bundle.coverAsset.publicUrl}
              alt={bundle.coverAsset.altText ?? bundle.post.title}
              className="max-h-96 w-full rounded-lg object-cover"
            />
          ) : null}
          <div className="flex flex-wrap gap-2 text-sm">
            {bundle.category ? (
              <Link href={`/categories/${bundle.category.slug}`} className="text-[var(--primary)]">
                {bundle.category.name}
              </Link>
            ) : null}
            {bundle.tags.map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`} className="text-[var(--primary)]">
                #{tag.name}
              </Link>
            ))}
          </div>
        </header>

        <div
          className="prose mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <nav aria-label="Post navigation" className="mt-10 flex justify-between gap-4 border-t border-[var(--border)] pt-6 text-sm">
          {neighbors.previous ? (
            <Link href={publicPostPath(neighbors.previous.slug)} className="text-[var(--primary)] hover:underline">
              ← {neighbors.previous.title}
            </Link>
          ) : (
            <span />
          )}
          {neighbors.next ? (
            <Link href={publicPostPath(neighbors.next.slug)} className="text-right text-[var(--primary)] hover:underline">
              {neighbors.next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </PublicLayout>
  );
}
