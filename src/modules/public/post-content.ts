import { renderMarkdownToHtml } from "@/modules/markdown/markdown-renderer";
import type { Post } from "@/modules/posts/posts.types";

export async function getPostHtmlContent(post: Post): Promise<string> {
  if (post.contentHtmlCache?.trim()) {
    return post.contentHtmlCache;
  }
  return renderMarkdownToHtml(post.contentMarkdown);
}
