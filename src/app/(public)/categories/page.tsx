import { PublicLayout } from "@/components/public/public-layout";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { CategoryList } from "@/components/public/category-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import { listPublicCategories } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return {
    ...buildSiteMetadata(config),
    title: "Categories",
    description:
      "Browse articles by editorial category: AI Engineering, Software & Solution Architecture, Engineering Leadership, Technology Strategy, and Career & Reflections.",
    alternates: {
      canonical: "/categories",
    },
  };
}

export default async function CategoriesIndexPage() {
  const config = await getBlogConfig();
  const categories = await listPublicCategories();

  return (
    <PublicLayout config={config}>
      <PublicPageShell>
        <PublicPageHero
          eyebrow="Editorial navigation"
          title="Categories"
          description="Browse articles by the five editorial categories that organize this site."
        />
        <section aria-labelledby="categories-list-heading">
          <h2 id="categories-list-heading" className="sr-only">
            All categories
          </h2>
          <CategoryList categories={categories} />
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}
