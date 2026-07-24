import { PublicEmptyState } from "@/components/public/public-empty-state";
import { AboutPreview } from "@/components/public/about-preview";
import { FeaturedInsightsSection } from "@/components/public/featured-insights-section";
import { HomeHero } from "@/components/public/home-hero";
import { PublicLayout } from "@/components/public/public-layout";
import { RecentPostsSection } from "@/components/public/recent-posts-section";
import { TopicsSection } from "@/components/public/topics-section";
import { getBlogConfig } from "@/modules/public/blog-config";
import {
  getHomePagePosts,
  getHomePageTopics,
} from "@/modules/public/public-posts.service";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return buildSiteMetadata(config);
}

export default async function HomePage() {
  const { config, featuredInsights, recent } = await getHomePagePosts();
  const hasPublishedPosts = featuredInsights.length > 0 || recent.length > 0;
  const topics = hasPublishedPosts ? await getHomePageTopics() : null;

  const primaryPostsHref =
    featuredInsights.length > 0 ? "#featured-insights" : recent.length > 0 ? "#recent-posts" : "/blog";

  return (
    <PublicLayout config={config}>
      <div className="space-y-14">
        <HomeHero primaryPostsHref={primaryPostsHref} />

        {featuredInsights.length > 0 ? (
          <FeaturedInsightsSection posts={featuredInsights} />
        ) : (
          <PublicEmptyState
            title="No posts published yet"
            description="Published posts will appear here once they are available."
          />
        )}

        {hasPublishedPosts ? <RecentPostsSection posts={recent} heading="Latest articles" /> : null}

        {hasPublishedPosts && topics ? (
          <TopicsSection categories={topics.popularCategories} tags={topics.popularTags} />
        ) : null}

        <AboutPreview />
      </div>
    </PublicLayout>
  );
}
