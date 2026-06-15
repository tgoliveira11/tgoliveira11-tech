import { desc } from "drizzle-orm";
import { db, closeDb } from "@/db/get-db";
import { assets } from "@/modules/assets/assets.schema";
import { posts } from "@/modules/posts/posts.schema";
import { loadEnvFiles } from "@/lib/load-env";

loadEnvFiles();

async function main() {
  const recentPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      contentLength: posts.contentMarkdown,
      excerpt: posts.excerpt,
      coverAssetId: posts.coverAssetId,
      ogAssetId: posts.ogAssetId,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(20);

  console.log("Recent posts:");
  for (const post of recentPosts) {
    console.log({
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      contentMarkdownLength: post.contentLength.length,
      excerpt: post.excerpt,
      coverAssetId: post.coverAssetId,
      ogAssetId: post.ogAssetId,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    });
  }

  const recentAssets = await db
    .select({
      id: assets.id,
      postId: assets.postId,
      originalFilename: assets.originalFilename,
      publicUrl: assets.publicUrl,
      createdAt: assets.createdAt,
    })
    .from(assets)
    .orderBy(desc(assets.createdAt))
    .limit(20);

  console.log("\nRecent assets:");
  for (const asset of recentAssets) {
    console.log({
      id: asset.id,
      postId: asset.postId,
      originalFilename: asset.originalFilename,
      publicUrl: asset.publicUrl,
      createdAt: asset.createdAt.toISOString(),
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
