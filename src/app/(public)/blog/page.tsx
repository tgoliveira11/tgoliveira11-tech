import { PublicLayout } from "@/components/public/public-layout";
import { PostList } from "@/components/public/post-list";
import { Pagination } from "@/components/public/pagination";
import { getBlogListingPage } from "@/modules/public/public-posts.service";
import { getBlogConfig } from "@/modules/public/blog-config";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return {
    ...buildSiteMetadata(config),
    title: "Blog",
    description: `Published posts from ${config.title}`,
  };
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const { config, posts, totalPages } = await getBlogListingPage(page);

  return (
    <PublicLayout config={config}>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 text-[var(--muted)]">Published posts only.</p>
        <div className="mt-8">
          <PostList posts={posts} />
        </div>
        <Pagination basePath="/blog" page={page} totalPages={totalPages} />
      </section>
    </PublicLayout>
  );
}
