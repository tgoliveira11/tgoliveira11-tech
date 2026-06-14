import { PublicLayout } from "@/components/public/public-layout";
import { CategoryList } from "@/components/public/category-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import { listPublicCategories } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return { ...buildSiteMetadata(config), title: "Categories" };
}

export default async function CategoriesIndexPage() {
  const config = await getBlogConfig();
  const categories = await listPublicCategories();

  return (
    <PublicLayout config={config}>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Categories that have at least one published post.
        </p>
        <div className="mt-8">
          <CategoryList categories={categories} />
        </div>
      </section>
    </PublicLayout>
  );
}
