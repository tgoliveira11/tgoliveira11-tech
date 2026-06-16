import type { Post } from "@/modules/posts/posts.types";

function FeaturedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function PinnedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-1 1A1 1 0 008 4v1.586l-3.707 3.707A1 1 0 004 10.414V12a1 1 0 001 1h2.586l4.707 4.707a1 1 0 001.414-1.414L10.414 12H12a1 1 0 001-1v-1.586a1 1 0 00-.293-.707L9 5.586V4l1-1a1 1 0 000-1.414z" />
    </svg>
  );
}

export function PostFlagsIcons({ post }: { post: Post }) {
  if (!post.featured && !post.pinned) {
    return <span className="text-xs text-[var(--muted)]">—</span>;
  }

  return (
    <div className="flex items-center gap-2 text-[var(--foreground)]">
      {post.featured ? (
        <span
          className="inline-flex text-amber-500 dark:text-amber-400"
          title="Featured post"
          aria-label="Featured post"
        >
          <FeaturedIcon />
        </span>
      ) : null}
      {post.pinned ? (
        <span
          className="inline-flex text-violet-600 dark:text-violet-400"
          title={`Pinned post${post.pinnedPriority ? ` (priority ${post.pinnedPriority})` : ""}`}
          aria-label={`Pinned post${post.pinnedPriority ? `, priority ${post.pinnedPriority}` : ""}`}
        >
          <PinnedIcon />
        </span>
      ) : null}
    </div>
  );
}
