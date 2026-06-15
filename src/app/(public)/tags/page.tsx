import { PublicLayout } from "@/components/public/public-layout";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { TagList } from "@/components/public/tag-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import { listPublicTags } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return {
    ...buildSiteMetadata(config),
    title: "Tags",
    description: "Explore posts by topic.",
  };
}

export default async function TagsIndexPage() {
  const config = await getBlogConfig();
  const tags = await listPublicTags();

  return (
    <PublicLayout config={config}>
      <PublicPageShell>
        <PublicPageHero
          eyebrow="Topics"
          title="Tags"
          description="Explore posts by topic."
        />
        <section aria-labelledby="tags-list-heading">
          <h2 id="tags-list-heading" className="sr-only">
            All tags
          </h2>
          <TagList tags={tags} />
        </section>
      </PublicPageShell>
    </PublicLayout>
  );
}
