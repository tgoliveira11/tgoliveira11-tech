import { PublicLayout } from "@/components/public/public-layout";
import { PostList } from "@/components/public/post-list";
import { SearchForm } from "@/components/public/search-form";
import { EmptyState } from "@/components/public/empty-state";
import { getBlogConfig } from "@/modules/public/blog-config";
import { searchPublishedPostBundles } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return { ...buildSiteMetadata(config), title: "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const config = await getBlogConfig();
  const results = query ? await searchPublishedPostBundles(query) : [];

  return (
    <PublicLayout config={config}>
      <section className="space-y-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
          <p className="mt-2 text-[var(--muted)]">Search published posts only.</p>
        </div>

        <SearchForm defaultQuery={query} />

        {query ? (
          <div>
            <p className="mb-4 text-sm text-[var(--muted)]">
              {results.length} result{results.length === 1 ? "" : "s"} for &quot;{query}&quot;
            </p>
            {results.length > 0 ? (
              <PostList posts={results} />
            ) : (
              <EmptyState
                title="No results found"
                description="Try a different keyword or browse the latest posts."
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="Start searching"
            description="Enter a keyword to search titles, excerpts, and post content."
          />
        )}
      </section>
    </PublicLayout>
  );
}
