import { readEnv } from "@/lib/env";
import { ValidationError } from "@/lib/errors";
import * as postsService from "@/modules/posts/posts.service";
import { publicPostPath } from "@/modules/posts/slug";
import * as redirectsService from "@/modules/redirects/redirects.service";
import { safeFetchHtml } from "./url-fetch";
import { downloadAndUploadMainImage } from "./url-post-images";
import { parseUrlPostHtml, rewriteMarkdownImageUrl } from "./url-post-parser";
import type { UrlPostImportReport, UrlPostImportResult } from "./url-post-importer.types";

export type ImportPostFromUrlInput = {
  url: string;
  createRedirect: boolean;
  userId: string;
  fetchImpl?: typeof fetch;
};

export async function importPostFromUrl(input: ImportPostFromUrlInput): Promise<UrlPostImportResult> {
  const warnings: string[] = [];

  const fetched = await safeFetchHtml({
    url: input.url,
    fetchImpl: input.fetchImpl,
  });

  const parsed = parseUrlPostHtml({
    html: fetched.body.toString("utf8"),
    finalUrl: fetched.finalUrl,
  });

  warnings.push(...parsed.warnings);

  if (!parsed.title.trim()) {
    throw new ValidationError("No title could be extracted from the page");
  }

  if (!parsed.contentMarkdown.trim()) {
    throw new ValidationError("No article content could be extracted from the page");
  }

  const requestedSlug = parsed.slug;
  const post = await postsService.createDraft(
    {
      title: parsed.title,
      slug: requestedSlug,
      excerpt: parsed.excerpt || undefined,
      contentMarkdown: parsed.contentMarkdown,
    },
    input.userId
  );

  if (post.slug !== requestedSlug) {
    warnings.push(`Slug "${requestedSlug}" already exists; saved as "${post.slug}"`);
  }

  let contentMarkdown = parsed.contentMarkdown;
  let mainImageImported = false;
  const mainImageUrl = parsed.mainImageUrl;

  if (parsed.mainImageUrl) {
    try {
      const uploaded = await downloadAndUploadMainImage({
        imageUrl: parsed.mainImageUrl,
        postId: post.id,
        title: parsed.title,
        userId: input.userId,
        fetchImpl: input.fetchImpl,
      });
      mainImageImported = true;
      contentMarkdown = rewriteMarkdownImageUrl(
        contentMarkdown,
        parsed.mainImageUrl,
        uploaded.publicUrl
      );

      await postsService.updateDraft(
        post.id,
        {
          contentMarkdown,
          coverAssetId: uploaded.assetId,
          ogAssetId: uploaded.assetId,
          seoTitle: parsed.title,
          seoDescription: parsed.excerpt || null,
          ogTitle: parsed.title,
          ogDescription: parsed.excerpt || null,
          canonicalUrl: null,
          createRevision: true,
        },
        input.userId
      );
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Main image could not be imported: ${error.message}`
          : "Main image could not be imported"
      );
      await postsService.updateDraft(
        post.id,
        {
          seoTitle: parsed.title,
          seoDescription: parsed.excerpt || null,
          ogTitle: parsed.title,
          ogDescription: parsed.excerpt || null,
          canonicalUrl: null,
          createRevision: true,
        },
        input.userId
      );
    }
  } else {
    await postsService.updateDraft(
      post.id,
      {
        seoTitle: parsed.title,
        seoDescription: parsed.excerpt || null,
        ogTitle: parsed.title,
        ogDescription: parsed.excerpt || null,
        canonicalUrl: null,
        createRevision: true,
      },
      input.userId
    );
  }

  let redirectCreated = false;
  if (input.createRedirect && shouldCreateRedirect(parsed.finalUrl)) {
    try {
      await redirectsService.createRedirect({
        sourcePath: parsed.sourcePath,
        targetPath: publicPostPath(post.slug),
        statusCode: 301,
      });
      redirectCreated = true;
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? `Redirect was not created: ${error.message}`
          : "Redirect was not created"
      );
    }
  } else if (input.createRedirect) {
    warnings.push(
      "Redirect was not created because the source URL does not belong to this site's domain"
    );
  }

  const report: UrlPostImportReport = {
    finalUrl: parsed.finalUrl,
    sourcePath: parsed.sourcePath,
    requestedSlug,
    postId: post.id,
    postSlug: post.slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    mainImageImported,
    mainImageUrl,
    redirectCreated,
    warnings,
  };

  return {
    postId: post.id,
    report,
  };
}

function shouldCreateRedirect(sourceUrl: string): boolean {
  const appBaseUrl = readEnv("APP_BASE_URL") ?? readEnv("NEXTAUTH_URL");
  if (!appBaseUrl) {
    return false;
  }

  try {
    const source = new URL(sourceUrl);
    const base = new URL(appBaseUrl);
    return source.hostname === base.hostname;
  } catch {
    return false;
  }
}

