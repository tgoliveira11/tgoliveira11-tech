import { PublicEmptyState } from "@/components/public/public-empty-state";
import { FeaturedPostCard } from "@/components/public/featured-post-card";
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
  const { config, featuredPost, recent } = await getHomePagePosts();
  const hasPublishedPosts = Boolean(featuredPost);
  const topics = hasPublishedPosts ? await getHomePageTopics() : null;

  return (
    <PublicLayout config={config}>
      <div className="space-y-14">
        <HomeHero config={config} />

        {featuredPost ? (
          <section aria-labelledby="featured-post-heading">
            <h2 id="featured-post-heading" className="sr-only">
              Featured post
            </h2>
            <FeaturedPostCard bundle={featuredPost} />
          </section>
        ) : (
          <PublicEmptyState
            title="No posts published yet"
            description="Published posts will appear here once they are available."
          />
        )}

        {hasPublishedPosts ? <RecentPostsSection posts={recent} /> : null}

        {hasPublishedPosts && topics ? (
          <TopicsSection categories={topics.popularCategories} tags={topics.popularTags} />
        ) : null}
      </div>
    </PublicLayout>
  );
}
