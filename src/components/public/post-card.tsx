import Link from "next/link";
import { PostImage } from "@/components/public/post-image";
import { PostMeta } from "@/components/public/post-meta";
import { getPostImageAltText } from "@/modules/public/editorial-taxonomy";
import { DEFAULT_VISIBLE_TAGS, limitTagsForDisplay } from "@/modules/public/public-display";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { publicPostPath } from "@/modules/posts/slug";

export function PostCard({
  bundle,
  variant = "default",
  maxTags = DEFAULT_VISIBLE_TAGS,
  showPromotionBadges = true,
  analyticsEvent = "article_card_click",
  analyticsComponent = "post_card",
}: {
  bundle: PublicPostBundle;
  variant?: "default" | "compact";
  maxTags?: number;
  showPromotionBadges?: boolean;
  analyticsEvent?: string;
  analyticsComponent?: string;
}) {
  const { post, category, tags, coverAsset } = bundle;
  const { visible: visibleTags, hiddenCount } = limitTagsForDisplay(tags, maxTags);
  const postHref = publicPostPath(post.slug);
  const isCompact = variant === "compact";

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-sm)] transition hover:border-[var(--primary)]/40 ${
        isCompact ? "" : "p-6"
      }`}
    >
      {coverAsset ? (
        <Link
          href={postHref}
          className={`relative block overflow-hidden bg-[var(--surface-subtle)] ${
            isCompact ? "aspect-[16/9]" : "mb-4 aspect-[16/9] rounded-lg"
          }`}
          aria-label={`View cover image for ${post.title}`}
          data-analytics-event={analyticsEvent}
          data-analytics-component={analyticsComponent}
          data-analytics-article-slug={post.slug}
        >
          <PostImage
            src={coverAsset.publicUrl}
            alt={getPostImageAltText(post, coverAsset.altText)}
            width={coverAsset.width}
            height={coverAsset.height}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      ) : null}

      <div className={`flex flex-1 flex-col ${isCompact ? "p-4" : ""}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {showPromotionBadges && post.pinned ? (
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--primary)]">
              Pinned
            </span>
          ) : null}
          {showPromotionBadges && post.featured ? (
            <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Featured
            </span>
          ) : null}
          {category ? (
            <Link
              href={`/categories/${category.slug}`}
              className="break-words text-xs font-medium uppercase tracking-wide text-[var(--muted)] hover:text-[var(--primary)]"
            >
              {category.name}
            </Link>
          ) : null}
        </div>

        <h2
          className={`break-words font-semibold leading-tight tracking-tight ${
            isCompact ? "mt-1.5 text-base leading-snug" : "mt-2 text-2xl"
          }`}
        >
          <Link
            href={postHref}
            className="hover:text-[var(--primary)]"
            data-analytics-event={analyticsEvent}
            data-analytics-component={analyticsComponent}
            data-analytics-article-slug={post.slug}
          >
            {post.title}
          </Link>
        </h2>

        <PostMeta
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          readingTimeMinutes={post.readingTimeMinutes}
          className={isCompact ? "mt-1.5 text-xs" : "mt-2"}
        />

        {post.excerpt ? (
          <p
            className={`text-[var(--muted)] ${
              isCompact ? "mt-2 line-clamp-2 text-xs leading-relaxed" : "mt-3"
            }`}
          >
            {post.excerpt}
          </p>
        ) : null}

        {visibleTags.length > 0 ? (
          <ul
            className={`flex flex-wrap gap-1.5 ${isCompact ? "mt-2" : "mt-4"}`}
            aria-label="Post tags"
          >
            {visibleTags.map((tag) => (
              <li key={tag.id}>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="inline-flex max-w-full break-words rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-0.5 text-xs hover:border-[var(--primary)] hover:text-[var(--primary)]"
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

        <div className={isCompact ? "mt-auto pt-2" : "mt-auto pt-4"}>
          <Link
            href={postHref}
            className={`font-medium text-[var(--primary)] hover:underline ${
              isCompact ? "text-xs" : "text-sm"
            }`}
            data-analytics-event={analyticsEvent}
            data-analytics-component={analyticsComponent}
            data-analytics-article-slug={post.slug}
          >
            Read post
          </Link>
        </div>
      </div>
    </article>
  );
}
