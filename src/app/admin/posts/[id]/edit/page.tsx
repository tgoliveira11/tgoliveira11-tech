import { notFound } from "next/navigation";
import { PostEditorForm } from "@/components/admin/posts/post-editor-form";
import * as assetsService from "@/modules/assets/assets.service";
import * as categoriesService from "@/modules/categories/categories.service";
import * as postsService from "@/modules/posts/posts.service";
import * as tagsService from "@/modules/tags/tags.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminPostEditPage({ params }: PageProps) {
  const { id } = await params;

  let bundle;
  try {
    bundle = await postsService.getAdminPostBundle(id);
  } catch {
    notFound();
  }

  const [categories, tags, assets] = await Promise.all([
    categoriesService.listCategories(),
    tagsService.listTags(),
    assetsService.listAssetsByPost(id),
  ]);

  return (
    <PostEditorForm bundle={bundle} categories={categories} tags={tags} assets={assets} />
  );
}
