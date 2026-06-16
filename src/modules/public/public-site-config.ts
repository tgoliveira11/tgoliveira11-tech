import type { BlogConfig } from "@/modules/public/blog-config";

/** Repo-specific public surface customization (not shared with PostForge upstream). */
export const PUBLIC_SITE_CONFIG = {
  /** Header title override — falls back to blog config title. */
  siteTitle: "tgoliveira11 Tech",
  header: {
    /** Show compact search in the header from this breakpoint upward (`sm` = 640px). */
    showSearchFrom: "sm" as const,
    /** Hide the Search nav link when the header search is visible. */
    hideNavSearchWhenHeaderSearchVisible: true,
  },
  footer: {
    showDescription: false,
    compact: true,
  },
} as const;

export function getPublicSiteTitle(config: BlogConfig): string {
  return PUBLIC_SITE_CONFIG.siteTitle || config.title;
}
