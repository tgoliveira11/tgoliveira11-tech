import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/public/public-layout";
import { PostList } from "@/components/public/post-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import { listPublishedPostBundlesByCategorySlug } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const result = await listPublishedPostBundlesByCategorySlug(slug, { limit: 1 });
  if (!result) return { title: "Category not found" };
  const config = await getBlogConfig();
  return {
    ...buildSiteMetadata(config),
    title: `Category: ${result.category.name}`,
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await listPublishedPostBundlesByCategorySlug(slug);
  if (!result) notFound();

  const config = await getBlogConfig();

  return (
    <PublicLayout config={config}>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">{result.category.name}</h1>
        {result.category.description ? (
          <p className="mt-2 text-[var(--muted)]">{result.category.description}</p>
        ) : null}
        <div className="mt-8">
          <PostList
            posts={result.posts}
            emptyMessage="No published posts in this category yet."
          />
        </div>
      </section>
    </PublicLayout>
  );
}
