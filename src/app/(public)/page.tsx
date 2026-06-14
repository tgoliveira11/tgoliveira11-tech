import { PublicLayout } from "@/components/public/public-layout";
import { PostList } from "@/components/public/post-list";
import { SearchForm, SearchShortcut } from "@/components/public/search-form";
import { CategoryList } from "@/components/public/category-list";
import { TagList } from "@/components/public/tag-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import {
  getHomePagePosts,
  listPublicCategories,
  listPublicTags,
} from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return buildSiteMetadata(config);
}

export default async function HomePage() {
  const { config, pinned, recent } = await getHomePagePosts();
  const [categories, tags] = await Promise.all([listPublicCategories(), listPublicTags()]);

  return (
    <PublicLayout config={config}>
      <section className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">{config.title}</h1>
          <p className="max-w-2xl text-lg text-[var(--muted)]">{config.description}</p>
          <SearchForm />
        </div>

        {pinned.length > 0 ? (
          <section aria-labelledby="pinned-posts-heading">
            <h2 id="pinned-posts-heading" className="mb-4 text-2xl font-semibold">
              Pinned
            </h2>
            <PostList posts={pinned} />
          </section>
        ) : null}

        <section aria-labelledby="recent-posts-heading">
          <h2 id="recent-posts-heading" className="mb-4 text-2xl font-semibold">
            Recent posts
          </h2>
          <PostList posts={recent} emptyMessage="No published posts yet. Check back soon." />
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Categories</h2>
            <CategoryList categories={categories.slice(0, 6)} />
          </div>
          <div>
            <h2 className="mb-4 text-xl font-semibold">Tags</h2>
            <TagList tags={tags.slice(0, 12)} />
          </div>
        </section>

        <SearchShortcut />
      </section>
    </PublicLayout>
  );
}
