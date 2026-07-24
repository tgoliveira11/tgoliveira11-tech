import type { Metadata } from "next";
import type { BlogConfig } from "./blog-config";
import { PUBLIC_AUTHOR_PROFILE } from "./author-profile";
import {
  PROFESSIONAL_AUTHOR_TITLE,
  SITE_NAME,
} from "./editorial-taxonomy";
import type { PublicPostBundle } from "./public-posts.repository";
import { findAssetById } from "./public-posts.repository";
import {
  getPublicSiteDescription,
  getPublicSiteTitle,
} from "./public-site-config";
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
  const description =
    post.seoDescription?.trim() ||
    post.excerpt?.trim() ||
    getPublicSiteDescription(input.config);
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

export function buildPostMetadata(
  resolved: ResolvedPostSeo,
  bundle?: PublicPostBundle
): Metadata {
  return {
    title: resolved.title,
    description: resolved.description,
    authors: [{ name: PUBLIC_AUTHOR_PROFILE.fullName, url: PUBLIC_AUTHOR_PROFILE.website }],
    category: bundle?.category?.name,
    keywords: bundle?.tags.map((tag) => tag.name),
    alternates: {
      canonical: resolved.canonicalUrl,
    },
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      type: "article",
      url: resolved.canonicalUrl,
      siteName: SITE_NAME,
      publishedTime: bundle?.post.publishedAt?.toISOString(),
      modifiedTime: bundle?.post.updatedAt.toISOString(),
      authors: [PUBLIC_AUTHOR_PROFILE.website],
      tags: bundle?.tags.map((tag) => tag.name),
      images: resolved.ogImageUrl ? [{ url: resolved.ogImageUrl }] : undefined,
    },
    twitter: {
      card: resolved.ogImageUrl ? "summary_large_image" : "summary",
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: resolved.ogImageUrl ? [resolved.ogImageUrl] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildPersonJsonLd(config: BlogConfig): Record<string, unknown> {
  const baseUrl = config.baseUrl.replace(/\/$/, "");

  return {
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: PUBLIC_AUTHOR_PROFILE.fullName,
    url: baseUrl,
    jobTitle: PROFESSIONAL_AUTHOR_TITLE,
    sameAs: [PUBLIC_AUTHOR_PROFILE.linkedIn, PUBLIC_AUTHOR_PROFILE.github],
  };
}

export function buildWebsiteJsonLd(config: BlogConfig): Record<string, unknown> {
  const baseUrl = config.baseUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: getPublicSiteTitle(config),
    description: getPublicSiteDescription(config),
    url: baseUrl,
    publisher: buildPersonJsonLd(config),
    inLanguage: "en",
  };
}

export function buildBlogPostingJsonLd(
  bundle: PublicPostBundle,
  resolved: ResolvedPostSeo
): Record<string, unknown> {
  const baseUrl = resolved.canonicalUrl.replace(publicPostPath(bundle.post.slug), "");

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${resolved.canonicalUrl}#article`,
    headline: resolved.title,
    description: resolved.description,
    datePublished: bundle.post.publishedAt?.toISOString(),
    dateModified: bundle.post.updatedAt.toISOString(),
    mainEntityOfPage: resolved.canonicalUrl,
    image: resolved.ogImageUrl ?? undefined,
    url: resolved.canonicalUrl,
    author: {
      "@type": "Person",
      "@id": `${baseUrl}/#person`,
      name: PUBLIC_AUTHOR_PROFILE.fullName,
      url: baseUrl,
      jobTitle: PROFESSIONAL_AUTHOR_TITLE,
      sameAs: [PUBLIC_AUTHOR_PROFILE.linkedIn, PUBLIC_AUTHOR_PROFILE.github],
    },
    keywords: bundle.tags.map((tag) => tag.name).join(", ") || undefined,
    articleSection: bundle.category?.name,
    inLanguage: "en",
  };
}

export function buildArticleBreadcrumbJsonLd(
  bundle: PublicPostBundle,
  resolved: ResolvedPostSeo
): Record<string, unknown> {
  const baseUrl = resolved.canonicalUrl.replace(publicPostPath(bundle.post.slug), "");

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: bundle.category?.name ?? "Articles",
        item: bundle.category ? `${baseUrl}/categories/${bundle.category.slug}` : `${baseUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: bundle.post.title,
        item: resolved.canonicalUrl,
      },
    ],
  };
}

export function stringifyJsonLd(jsonLd: Record<string, unknown> | Record<string, unknown>[]): string {
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

export function buildSiteMetadata(config: BlogConfig): Metadata {
  const title = getPublicSiteTitle(config);
  const description = getPublicSiteDescription(config);
  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const defaultImage = config.defaultSeoImage ?? "/opengraph-image";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(config.baseUrl),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: baseUrl,
      siteName: title,
      images: [{ url: defaultImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
