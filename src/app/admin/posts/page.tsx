import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { CreateDraftButton } from "@/components/admin/posts/create-draft-button";
import { PostFilters } from "@/components/admin/posts/post-filters";
import { PostTable } from "@/components/admin/posts/post-table";
import { createDraftAction } from "@/modules/posts/admin-posts.actions";
import { parseAdminPostsSortInput } from "@/modules/posts/admin-posts-sort";
import * as categoriesService from "@/modules/categories/categories.service";
import * as postsService from "@/modules/posts/posts.service";
import * as tagsService from "@/modules/tags/tags.service";
import type { PostStatus } from "@/modules/posts/posts.types";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    search?: string;
    categoryId?: string;
    tagId?: string;
    sort?: string;
    direction?: string;
  }>;
};

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sortState = parseAdminPostsSortInput(params);
  const [categories, tags, orderedPublished] = await Promise.all([
    categoriesService.listCategories(),
    tagsService.listTags(),
    postsService.listPublishedPostsWithPublicOrder(),
  ]);

  const filters = {
    status: params.status as PostStatus | undefined,
    search: params.search,
    categoryId: params.categoryId,
    tagId: params.tagId,
    sort: sortState.sort,
    direction: sortState.direction,
    limit: 100,
  };

  if (!filters.status) delete filters.status;
  if (!filters.tagId) delete filters.tagId;
  if (sortState.usesDefaultSort) {
    delete filters.sort;
    delete filters.direction;
  }

  const posts = await postsService.listAdminPosts(filters);
  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));
  const orderedPublishedIds = orderedPublished.map((post) => post.id);
  const filterParams = {
    status: params.status,
    search: params.search,
    categoryId: params.categoryId,
    tagId: params.tagId,
    sort: sortState.sort,
    direction: sortState.direction,
  };

  return (
    <div>
      <AdminPageTitle
        title="Posts"
        description="Manage drafts, published content, and public listing order."
        actions={
          <form action={createDraftAction}>
            <CreateDraftButton className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
              New Post
            </CreateDraftButton>
          </form>
        }
      />

      <PostFilters categories={categories} tags={tags} current={params} />

      <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)]">Manual public order</p>
        <p className="mt-1">
          Controls how posts appear on the home page and blog listing. Lower numbers appear first.
          Posts without a manual order are sorted by publish date. Only published posts appear in
          public ordering. Pinned and featured posts still control home-page promotion separately.
          New posts start without a public order — use Set to assign one, then use arrows to reorder.
          Click column headers to sort this table; default order is public order ascending.
        </p>
      </div>

      {posts.length === 0 ? (
        <AdminEmptyState
          title="No posts found"
          description="Try different filters or create a new draft."
          action={
            <form action={createDraftAction}>
              <CreateDraftButton className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-white">
                Create draft
              </CreateDraftButton>
            </form>
          }
        />
      ) : (
        <PostTable
          posts={posts}
          categoryNames={categoryNames}
          orderedPublishedIds={orderedPublishedIds}
          sortState={sortState}
          filterParams={filterParams}
        />
      )}
    </div>
  );
}
