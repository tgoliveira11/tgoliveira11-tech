import Link from "next/link";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";
import { publicPostPath } from "@/modules/posts/slug";

function formatDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function PostCard({ bundle }: { bundle: PublicPostBundle }) {
  const { post, category, tags, coverAsset } = bundle;
  const publishedLabel = formatDate(post.publishedAt);

  return (
    <article className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {post.pinned ? <span className="text-[var(--primary)]">Pinned</span> : null}
        {post.featured ? <span>Featured</span> : null}
        {publishedLabel ? <time dateTime={post.publishedAt?.toISOString()}>{publishedLabel}</time> : null}
        {post.readingTimeMinutes ? <span>{post.readingTimeMinutes} min read</span> : null}
      </div>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
        <Link href={publicPostPath(post.slug)} className="hover:text-[var(--primary)]">
          {post.title}
        </Link>
      </h2>

      {post.excerpt ? <p className="mt-3 text-[var(--muted)]">{post.excerpt}</p> : null}

      {coverAsset ? (
        <img
          src={coverAsset.publicUrl}
          alt={coverAsset.altText ?? post.title}
          className="mt-4 max-h-64 w-full rounded-md object-cover"
        />
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        {category ? (
          <Link
            href={`/categories/${category.slug}`}
            className="rounded-full bg-[var(--background)] px-3 py-1 hover:text-[var(--primary)]"
          >
            {category.name}
          </Link>
        ) : null}
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className="rounded-full bg-[var(--background)] px-3 py-1 hover:text-[var(--primary)]"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </article>
  );
}
