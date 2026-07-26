import { revalidatePath } from "next/cache";
import { publicPostPath } from "@/modules/posts/slug";

export function revalidatePublicPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/tags");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/rss.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");
  revalidatePath("/sitemap.xml");

  if (slug) {
    revalidatePath(publicPostPath(slug));
  }
}
