import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/public/public-layout";
import { PostList } from "@/components/public/post-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import { listPublishedPostBundlesByTagSlug } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const result = await listPublishedPostBundlesByTagSlug(slug, { limit: 1 });
  if (!result) return { title: "Tag not found" };
  const config = await getBlogConfig();
  return {
    ...buildSiteMetadata(config),
    title: `Tag: ${result.tag.name}`,
  };
}

export default async function TagDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await listPublishedPostBundlesByTagSlug(slug);
  if (!result) notFound();

  const config = await getBlogConfig();

  return (
    <PublicLayout config={config}>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">#{result.tag.name}</h1>
        <p className="mt-2 text-[var(--muted)]">Published posts tagged with {result.tag.name}.</p>
        <div className="mt-8">
          <PostList
            posts={result.posts}
            emptyMessage="No published posts for this tag yet."
          />
        </div>
      </section>
    </PublicLayout>
  );
}
