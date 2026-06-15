import Link from "next/link";
import { PostImage } from "@/components/public/post-image";
import { ArticleMeta } from "@/components/public/article-meta";
import type { PublicPostBundle } from "@/modules/public/public-posts.repository";

export function ArticleHeader({ bundle }: { bundle: PublicPostBundle }) {
  const { post, category, tags, coverAsset } = bundle;

  return (
    <header className="space-y-6 border-b border-[var(--border)] pb-8">
      <div className="flex flex-wrap items-center gap-3">
        {category ? (
          <Link
            href={`/categories/${category.slug}`}
            className="inline-flex rounded-full bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)] hover:opacity-90"
          >
            {category.name}
          </Link>
        ) : null}
        <ArticleMeta
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          readingTimeMinutes={post.readingTimeMinutes}
        />
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        {post.excerpt ? (
          <p className="max-w-3xl text-xl leading-relaxed text-[var(--muted)]">{post.excerpt}</p>
        ) : null}
      </div>

      {coverAsset ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)]">
          <PostImage
            src={coverAsset.publicUrl}
            alt={coverAsset.altText ?? post.title}
            width={coverAsset.width}
            height={coverAsset.height}
            className="aspect-[16/9] w-full object-cover"
            priority
          />
        </div>
      ) : null}

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Article tags">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Link
                href={`/tags/${tag.slug}`}
                className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                #{tag.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
