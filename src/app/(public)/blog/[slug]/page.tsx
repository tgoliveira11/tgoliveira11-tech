import { notFound, permanentRedirect } from "next/navigation";
import { ArticleAuthorBox } from "@/components/public/article-author-box";
import { ArticleHeader } from "@/components/public/article-header";
import { ArticleNavigation } from "@/components/public/article-navigation";
import { PublicBackLink } from "@/components/public/public-breadcrumbs";
import { PublicLayout } from "@/components/public/public-layout";
import { PostViewTracker } from "@/components/public/post-view-tracker";
import { RelatedArticlesSection } from "@/components/public/related-articles-section";
import { getBlogConfig } from "@/modules/public/blog-config";
import { getPostHtmlContent } from "@/modules/public/post-content";
import {
  getPublishedNeighbors,
  getPublishedPostBundleBySlug,
  listRelatedPublishedPostBundles,
} from "@/modules/public/public-posts.service";
import {
  buildArticleBreadcrumbJsonLd,
  buildBlogPostingJsonLd,
  buildPostMetadata,
  resolvePostSeoWithImages,
  stringifyJsonLd,
} from "@/modules/public/seo";
import { getCanonicalPostAliasTarget } from "@/modules/public/editorial-taxonomy";
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
  return buildPostMetadata(seo, bundle);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const bundle = await getPublishedPostBundleBySlug(slug);

  if (!bundle) {
    const staticTarget = getCanonicalPostAliasTarget(slug);
    if (staticTarget) {
      permanentRedirect(publicPostPath(staticTarget));
    }

    const redirect = await redirectsRepo.findRedirectBySourcePath(publicPostPath(slug));
    if (redirect) {
      permanentRedirect(redirect.targetPath);
    }
    notFound();
  }

  const config = await getBlogConfig();
  const [html, neighbors, seo, relatedArticles] = await Promise.all([
    getPostHtmlContent(bundle.post),
    getPublishedNeighbors(bundle.post.id),
    resolvePostSeoWithImages({ bundle, config }),
    listRelatedPublishedPostBundles(bundle, 3),
  ]);

  const jsonLd = [
    buildBlogPostingJsonLd(bundle, seo),
    buildArticleBreadcrumbJsonLd(bundle, seo),
  ];

  return (
    <PublicLayout config={config}>
      <PostViewTracker slug={bundle.post.slug} />
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <PublicBackLink href="/blog">Back to blog</PublicBackLink>
        </div>

        <ArticleHeader bundle={bundle} />

        <div
          className="prose prose-article mt-10 max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <ArticleAuthorBox />

        <ArticleNavigation previous={neighbors.previous} next={neighbors.next} />
      </article>

      <RelatedArticlesSection posts={relatedArticles} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
    </PublicLayout>
  );
}
