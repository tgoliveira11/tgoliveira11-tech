import { PublicLayout } from "@/components/public/public-layout";
import { TagList } from "@/components/public/tag-list";
import { getBlogConfig } from "@/modules/public/blog-config";
import { listPublicTags } from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return { ...buildSiteMetadata(config), title: "Tags" };
}

export default async function TagsIndexPage() {
  const config = await getBlogConfig();
  const tags = await listPublicTags();

  return (
    <PublicLayout config={config}>
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Tags</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Tags that have at least one published post.
        </p>
        <div className="mt-8">
          <TagList tags={tags} />
        </div>
      </section>
    </PublicLayout>
  );
}
