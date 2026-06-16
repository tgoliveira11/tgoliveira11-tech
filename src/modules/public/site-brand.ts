import type { Metadata } from "next";

/** Repo-local brand assets for tgoliveira11-tech (not shared with PostForge upstream). */
export const SITE_BRAND = {
  /** Source photo used to derive favicon assets. */
  profileSourceImage: "/images/about/thiago-oliveira.jpg",
  /** Generated brand assets (see `npm run icons:generate`). */
  assetsPath: "/images/brand",
} as const;

export const SITE_BRAND_ICONS: NonNullable<Metadata["icons"]> = {
  icon: [
    { url: `${SITE_BRAND.assetsPath}/favicon.ico`, sizes: "any" },
    { url: `${SITE_BRAND.assetsPath}/favicon-16.png`, sizes: "16x16", type: "image/png" },
    { url: `${SITE_BRAND.assetsPath}/favicon-32.png`, sizes: "32x32", type: "image/png" },
    { url: `${SITE_BRAND.assetsPath}/favicon-48.png`, sizes: "48x48", type: "image/png" },
    { url: `${SITE_BRAND.assetsPath}/icon-192.png`, sizes: "192x192", type: "image/png" },
    { url: `${SITE_BRAND.assetsPath}/icon-512.png`, sizes: "512x512", type: "image/png" },
  ],
  apple: [
    {
      url: `${SITE_BRAND.assetsPath}/apple-icon.png`,
      sizes: "180x180",
      type: "image/png",
    },
  ],
  shortcut: `${SITE_BRAND.assetsPath}/favicon.ico`,
};
