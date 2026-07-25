import Link from "next/link";
import { PostImage } from "@/components/public/post-image";
import { PostMeta } from "@/components/public/post-meta";
import { getPostImageAltText } from "@/modules/public/editorial-taxonomy";
import { getFeaturedPostLabel, limitTagsForDisplay } from "@/modules/public/public-display";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { publicPostPath } from "@/modules/posts/slug";

export function FeaturedPostCard({ bundle, label }: { bundle: PublicPostBundle; label?: string }) {
  const { post, category, tags, coverAsset } = bundle;
  const displayLabel = label ?? getFeaturedPostLabel(bundle);
  const { visible: visibleTags, hiddenCount } = limitTagsForDisplay(tags);
  const postHref = publicPostPath(post.slug);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/40">
      <div className="grid lg:grid-cols-2">
        {coverAsset ? (
          <Link
            href={postHref}
            className="relative block aspect-[16/10] overflow-hidden bg-[var(--surface-subtle)] lg:aspect-auto lg:min-h-[20rem]"
            aria-label={`View cover image for ${post.title}`}
            data-analytics-event="home_featured_insight_click"
            data-analytics-component="featured_insights"
            data-analytics-article-slug={post.slug}
          >
            <PostImage
              src={coverAsset.publicUrl}
              alt={getPostImageAltText(post, coverAsset.altText)}
              width={coverAsset.width}
              height={coverAsset.height}
              priority
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        ) : null}

        <div className={`flex min-w-0 flex-col justify-center p-4 sm:p-8 ${coverAsset ? "" : "lg:col-span-2"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
              {displayLabel}
            </span>
            {category ? (
              <Link
                href={`/categories/${category.slug}`}
                className="text-xs font-medium uppercase tracking-wide text-[var(--muted)] hover:text-[var(--primary)]"
              >
                {category.name}
              </Link>
            ) : null}
          </div>

          <h2 className="mt-4 break-words text-2xl font-semibold tracking-tight sm:text-4xl">
            <Link
              href={postHref}
              className="hover:text-[var(--primary)]"
              data-analytics-event="home_featured_insight_click"
              data-analytics-component="featured_insights"
              data-analytics-article-slug={post.slug}
            >
              {post.title}
            </Link>
          </h2>

          <PostMeta
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            readingTimeMinutes={post.readingTimeMinutes}
            className="mt-3"
          />

          {post.excerpt ? (
            <p className="mt-4 line-clamp-4 text-base leading-relaxed text-[var(--muted)]">
              {post.excerpt}
            </p>
          ) : null}

          {visibleTags.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Post tags">
              {visibleTags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/tags/${tag.slug}`}
                    className="inline-flex rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
              {hiddenCount > 0 ? (
                <li className="inline-flex items-center px-1 text-xs text-[var(--muted)]">
                  +{hiddenCount} more
                </li>
              ) : null}
            </ul>
          ) : null}

          <div className="mt-6">
            <Link
              href={postHref}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
              data-analytics-event="home_featured_insight_click"
              data-analytics-component="featured_insights"
              data-analytics-article-slug={post.slug}
            >
              Read post
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
