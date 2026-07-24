import type { Metadata } from "next";
import type { BlogConfig } from "./blog-config";
import { LLMS_FULL_TXT_PATH, LLMS_TXT_PATH } from "./ai-discovery";
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

const DEFAULT_SEO_IMAGE_PATH = "/opengraph-image";
const PERSON_IMAGE_PATH = "/images/about/thiago-oliveira.png";
const PERSON_KNOWS_ABOUT = [
  "Engineering Management",
  "Generative AI",
  "Agentic Systems",
  "Solution Architecture",
  "Cloud Architecture",
  "Distributed Systems",
  "Product Engineering",
  "Technology Strategy",
] as const;

export type PostSeoInput = {
  bundle: PublicPostBundle;
  config: BlogConfig;
};

export type ResolvedPostSeo = {
  title: string;
  description: string;
  canonicalUrl: string;
  siteBaseUrl?: string;
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
    siteBaseUrl: baseUrl,
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

  const fallbackSeoImage = input.config.defaultSeoImage?.trim() || DEFAULT_SEO_IMAGE_PATH;

  if (!ogImageUrl) {
    ogImageUrl = fallbackSeoImage.startsWith("http")
      ? fallbackSeoImage
      : `${baseUrl}${fallbackSeoImage.startsWith("/") ? "" : "/"}${fallbackSeoImage}`;
  }

  return { ...resolved, ogImageUrl };
}

function resolvePostSiteBaseUrl(resolved: ResolvedPostSeo): string {
  return (
    resolved.siteBaseUrl ??
    inferBaseUrlFromCanonical(resolved.canonicalUrl) ??
    PUBLIC_AUTHOR_PROFILE.website.replace(/\/$/, "")
  );
}

function buildAuthorUrl(baseUrl: string): string {
  return `${baseUrl}/about`;
}

function buildPublicRobots(): Metadata["robots"] {
  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

function buildPublicAlternateTypes(baseUrl: string): NonNullable<Metadata["alternates"]>["types"] {
  return {
    "application/rss+xml": `${baseUrl}/rss.xml`,
    "text/plain": [
      { title: "LLMs.txt", url: `${baseUrl}${LLMS_TXT_PATH}` },
      { title: "LLMs-full.txt", url: `${baseUrl}${LLMS_FULL_TXT_PATH}` },
    ],
  };
}

function inferBaseUrlFromCanonical(canonicalUrl: string): string | null {
  try {
    return new URL(canonicalUrl).origin;
  } catch {
    return null;
  }
}

export function buildPublicAlternates(
  config: BlogConfig,
  canonical: string
): Metadata["alternates"] {
  const baseUrl = config.baseUrl.replace(/\/$/, "");

  return {
    canonical,
    types: buildPublicAlternateTypes(baseUrl),
  };
}

export function buildPublicPageMetadata(
  config: BlogConfig,
  input: {
    title: string;
    description: string;
    canonicalPath: string;
    ogTitle?: string;
    ogDescription?: string;
  }
): Metadata {
  const title = input.title;
  const description = input.description;
  const ogTitle = input.ogTitle ?? title;
  const ogDescription = input.ogDescription ?? description;
  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const defaultImage = config.defaultSeoImage ?? DEFAULT_SEO_IMAGE_PATH;
  const siteTitle = getPublicSiteTitle(config);
  const canonicalUrl = `${baseUrl}${input.canonicalPath}`;

  return {
    title,
    description,
    metadataBase: new URL(config.baseUrl),
    alternates: buildPublicAlternates(config, input.canonicalPath),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: "website",
      url: canonicalUrl,
      siteName: siteTitle,
      images: [{ url: defaultImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [defaultImage],
    },
    robots: buildPublicRobots(),
  };
}

export function buildPostMetadata(
  resolved: ResolvedPostSeo,
  bundle?: PublicPostBundle
): Metadata {
  const siteBaseUrl = resolvePostSiteBaseUrl(resolved);
  const authorUrl = buildAuthorUrl(siteBaseUrl);

  return {
    title: resolved.title,
    description: resolved.description,
    metadataBase: new URL(siteBaseUrl),
    authors: [{ name: PUBLIC_AUTHOR_PROFILE.fullName, url: authorUrl }],
    creator: PUBLIC_AUTHOR_PROFILE.fullName,
    publisher: SITE_NAME,
    category: bundle?.category?.name,
    keywords: bundle?.tags.map((tag) => tag.name),
    alternates: {
      canonical: resolved.canonicalUrl,
      types: buildPublicAlternateTypes(siteBaseUrl),
    },
    openGraph: {
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      type: "article",
      url: resolved.canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_US",
      publishedTime: bundle?.post.publishedAt?.toISOString(),
      modifiedTime: bundle?.post.updatedAt.toISOString(),
      authors: [authorUrl],
      section: bundle?.category?.name,
      tags: bundle?.tags.map((tag) => tag.name),
      images: resolved.ogImageUrl ? [{ url: resolved.ogImageUrl, alt: resolved.ogTitle }] : undefined,
    },
    twitter: {
      card: resolved.ogImageUrl ? "summary_large_image" : "summary",
      title: resolved.ogTitle,
      description: resolved.ogDescription,
      images: resolved.ogImageUrl ? [resolved.ogImageUrl] : undefined,
    },
    robots: buildPublicRobots(),
  };
}

export function buildPersonJsonLd(config: BlogConfig): Record<string, unknown> {
  const baseUrl = config.baseUrl.replace(/\/$/, "");

  return {
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: PUBLIC_AUTHOR_PROFILE.fullName,
    url: buildAuthorUrl(baseUrl),
    image: `${baseUrl}${PERSON_IMAGE_PATH}`,
    jobTitle: PROFESSIONAL_AUTHOR_TITLE,
    sameAs: [PUBLIC_AUTHOR_PROFILE.linkedIn, PUBLIC_AUTHOR_PROFILE.github],
    knowsAbout: [...PERSON_KNOWS_ABOUT],
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
  const baseUrl = resolvePostSiteBaseUrl(resolved);
  const author = {
    "@type": "Person",
    "@id": `${baseUrl}/#person`,
    name: PUBLIC_AUTHOR_PROFILE.fullName,
    url: buildAuthorUrl(baseUrl),
    image: `${baseUrl}${PERSON_IMAGE_PATH}`,
    jobTitle: PROFESSIONAL_AUTHOR_TITLE,
    sameAs: [PUBLIC_AUTHOR_PROFILE.linkedIn, PUBLIC_AUTHOR_PROFILE.github],
    knowsAbout: [...PERSON_KNOWS_ABOUT],
  };

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${resolved.canonicalUrl}#article`,
    headline: resolved.title,
    description: resolved.description,
    datePublished: bundle.post.publishedAt?.toISOString(),
    dateModified: bundle.post.updatedAt.toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": resolved.canonicalUrl,
    },
    image: resolved.ogImageUrl ? [resolved.ogImageUrl] : undefined,
    url: resolved.canonicalUrl,
    author,
    publisher: author,
    keywords: bundle.tags.map((tag) => tag.name).join(", ") || undefined,
    articleSection: bundle.category?.name,
    timeRequired: bundle.post.readingTimeMinutes ? `PT${bundle.post.readingTimeMinutes}M` : undefined,
    inLanguage: "en",
  };
}

export function buildArticleBreadcrumbJsonLd(
  bundle: PublicPostBundle,
  resolved: ResolvedPostSeo
): Record<string, unknown> {
  const baseUrl = resolvePostSiteBaseUrl(resolved);

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
  const defaultImage = config.defaultSeoImage ?? DEFAULT_SEO_IMAGE_PATH;

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    metadataBase: new URL(config.baseUrl),
    alternates: buildPublicAlternates(config, "/"),
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
    robots: buildPublicRobots(),
  };
}
