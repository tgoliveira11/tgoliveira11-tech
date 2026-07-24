import { AboutPageContent } from "@/components/public/about-page-content";
import { PublicLayout } from "@/components/public/public-layout";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { ABOUT_PAGE_CONTENT } from "@/modules/public/about-content";
import { getBlogConfig } from "@/modules/public/blog-config";
import { getHomePagePosts } from "@/modules/public/public-posts.service";
import { buildPublicPageMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return buildPublicPageMetadata(config, {
    title: ABOUT_PAGE_CONTENT.metadata.title,
    description: ABOUT_PAGE_CONTENT.metadata.description,
    canonicalPath: "/about",
    ogTitle: ABOUT_PAGE_CONTENT.metadata.ogTitle,
    ogDescription: ABOUT_PAGE_CONTENT.metadata.ogDescription,
  });
}

export default async function AboutPage() {
  const { config, featuredInsights } = await getHomePagePosts();

  return (
    <PublicLayout config={config}>
      <PublicPageShell>
        <AboutPageContent selectedInsights={featuredInsights.slice(0, 4)} />
      </PublicPageShell>
    </PublicLayout>
  );
}
