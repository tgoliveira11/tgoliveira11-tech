import type { Metadata } from "next";
import type { BlogConfig } from "./blog-config";
import type { PublicPostBundle } from "./public-posts.repository";
import { findAssetById } from "./public-posts.repository";
import { publicPostPath } from "@/modules/posts/slug";

export type PostSeoInput = {
  bundle: PublicPostBundle;
  config: BlogConfig;
};

export type ResolvedPostSeo = {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string | null;
};

export function resolvePostSeo(input: PostSeoInput): ResolvedPostSeo {
  const { post } = input.bundle;
  const baseUrl = input.config.baseUrl.replace(/\/$/, "");

  const title = post.seoTitle?.trim() || post.title;
  const description = post.seoDescription?.trim() || post.excerpt?.trim() || input.config.description;
  const ogTitle = post.ogTitle?.trim() || title;
  const ogDescription = post.ogDescription?.trim() || description;
  const canonicalUrl = post.canonicalUrl?.trim() || `${baseUrl}${publicPostPath(post.slug)}`;

  return {
    title,
    description,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImageUrl: null,
  };
}

export async function resolvePostSeoWithImages(input: PostSeoInput): Promise<ResolvedPostSeo> {
  const resolved = resolvePostSeo(input);
  const baseUrl = input.config.baseUrl.replace(/\/$/, "");

  const ogAssetId = input.bundle.post.ogAssetId ?? input.bundle.post.coverAssetId;
  let ogImageUrl: string | null = null;

  if (ogAssetId) {
    const asset = await findAssetById(ogAssetId);
    if (asset?.publicUrl) {
      ogImageUrl = asset.publicUrl.startsWith("http")
        ? asset.publicUrl
        : `${baseUrl}${asset.publicUrl.startsWith("/") ? "" : "/"}${asset.publicUrl}`;
    }
  }

  if (!ogImageUrl && input.config.defaultSeoImage) {
    ogImageUrl = input.config.defaultSeoImage.startsWith("http")
      ? input.config.defaultSeoImage
      : `${baseUrl}${input.config.defaultSeoImage.startsWith("/") ? "" : "/"}${input.config.defaultSeoImage}`;
  }

  return { ...resolved, ogImageUrl };
}

export function buildPostMetadata(resolved: ResolvedPostSeo): Metadata {
  return {
    title: resolved.title,
    description: resolved.description,
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      type: "article",
      url: resolved.canonicalUrl,
      images: resolved.ogImageUrl ? [{ url: resolved.ogImageUrl }] : undefined,
    },
    twitter: {
      card: resolved.ogImageUrl ? "summary_large_image" : "summary",
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: resolved.ogImageUrl ? [resolved.ogImageUrl] : undefined,
    },
  };
}

export function buildBlogPostingJsonLd(
  bundle: PublicPostBundle,
  resolved: ResolvedPostSeo
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: resolved.title,
    description: resolved.description,
    datePublished: bundle.post.publishedAt?.toISOString(),
    dateModified: bundle.post.updatedAt.toISOString(),
    mainEntityOfPage: resolved.canonicalUrl,
    image: resolved.ogImageUrl ?? undefined,
    keywords: bundle.tags.map((tag) => tag.name).join(", ") || undefined,
    articleSection: bundle.category?.name,
  };
}

export function buildSiteMetadata(config: BlogConfig): Metadata {
  return {
    title: {
      default: config.title,
      template: `%s | ${config.title}`,
    },
    description: config.description,
    metadataBase: new URL(config.baseUrl),
  };
}
