import { AboutPageContent } from "@/components/public/about-page-content";
import { PublicLayout } from "@/components/public/public-layout";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { ABOUT_PAGE_CONTENT } from "@/modules/public/about-content";
import { getBlogConfig } from "@/modules/public/blog-config";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return {
    ...buildSiteMetadata(config),
    title: ABOUT_PAGE_CONTENT.metadata.title,
    description: ABOUT_PAGE_CONTENT.metadata.description,
  };
}

export default async function AboutPage() {
  const config = await getBlogConfig();

  return (
    <PublicLayout config={config}>
      <PublicPageShell>
        <AboutPageContent />
      </PublicPageShell>
    </PublicLayout>
  );
}
