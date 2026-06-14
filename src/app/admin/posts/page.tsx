import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { PostFilters } from "@/components/admin/posts/post-filters";
import { PostTable } from "@/components/admin/posts/post-table";
import { createDraftAction } from "@/modules/posts/admin-posts.actions";
import * as categoriesService from "@/modules/categories/categories.service";
import * as postsService from "@/modules/posts/posts.service";
import type { PostStatus } from "@/modules/posts/posts.types";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    search?: string;
    categoryId?: string;
    sort?: string;
  }>;
};

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categories = await categoriesService.listCategories();

  const filters = {
    status: params.status as PostStatus | undefined,
    search: params.search,
    categoryId: params.categoryId,
    sort: params.sort === "publishedAt" ? ("publishedAt" as const) : ("updatedAt" as const),
    limit: 100,
  };

  if (!filters.status) delete filters.status;

  const posts = await postsService.listAdminPosts(filters);
  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));

  return (
    <div>
      <AdminPageTitle
        title="Posts"
        description="Manage drafts, scheduled posts, and published content."
        actions={
          <form action={createDraftAction}>
            <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
              New Post
            </button>
          </form>
        }
      />

      <PostFilters categories={categories} current={params} />

      {posts.length === 0 ? (
        <AdminEmptyState
          title="No posts found"
          description="Try different filters or create a new draft."
          action={
            <form action={createDraftAction}>
              <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">
                Create draft
              </button>
            </form>
          }
        />
      ) : (
        <PostTable posts={posts} categoryNames={categoryNames} />
      )}

      <p className="mt-4 text-xs text-[var(--muted)]">
        Tag filtering is deferred — use search or category filters for now.
      </p>
    </div>
  );
}
