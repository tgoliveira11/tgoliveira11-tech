import type { Post } from "@/modules/posts/posts.types";
import { EditorCard } from "./editor-card";

function seoSummary(post: Post): string {
  const hasSeo = Boolean(post.seoTitle?.trim() || post.seoDescription?.trim());
  const hasOg = Boolean(post.ogTitle?.trim() || post.ogDescription?.trim());
  if (hasSeo && hasOg) return "SEO and social metadata configured";
  if (hasSeo) return "SEO title/description set · social fields optional";
  if (hasOg) return "Social metadata set · SEO title/description not set";
  return "SEO title and description not set";
}

export function PostSeoCard({ formId, post }: { formId: string; post: Post }) {
  return (
    <EditorCard title="SEO & social">
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--foreground)]">
          {seoSummary(post)}
        </summary>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block">SEO title</span>
            <input
              name="seoTitle"
              form={formId}
              defaultValue={post.seoTitle ?? ""}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">SEO description</span>
            <textarea
              name="seoDescription"
              form={formId}
              defaultValue={post.seoDescription ?? ""}
              rows={2}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">Canonical URL</span>
            <input
              name="canonicalUrl"
              form={formId}
              defaultValue={post.canonicalUrl ?? ""}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">OG title</span>
            <input
              name="ogTitle"
              form={formId}
              defaultValue={post.ogTitle ?? ""}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">OG description</span>
            <input
              name="ogDescription"
              form={formId}
              defaultValue={post.ogDescription ?? ""}
              className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2"
            />
          </label>
          <p className="text-xs text-[var(--muted)]">OG image is set in the assets panel above.</p>
        </div>
      </details>
    </EditorCard>
  );
}
