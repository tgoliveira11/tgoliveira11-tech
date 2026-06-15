import { revalidatePath } from "next/cache";
import { publicPostPath } from "@/modules/posts/slug";

export function revalidatePublicPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/tags");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/rss.xml");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(publicPostPath(slug));
  }
}
