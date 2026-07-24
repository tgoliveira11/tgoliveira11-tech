import type { BlogConfig } from "@/modules/public/blog-config";
import { SITE_INTRODUCTION, SITE_NAME } from "./editorial-taxonomy";

/** Repo-specific public surface customization (not shared with PostForge upstream). */
export const PUBLIC_SITE_CONFIG = {
  /** Header title override — falls back to blog config title. */
  siteTitle: SITE_NAME,
  /** Public metadata/RSS description override — falls back to blog config description. */
  siteDescription: SITE_INTRODUCTION,
  header: {
    /** Show compact search in the header from this breakpoint upward (`sm` = 640px). */
    showSearchFrom: "sm" as const,
    /** Hide the Search nav link when the header search is visible. */
    hideNavSearchWhenHeaderSearchVisible: true,
  },
  footer: {
    showDescription: false,
    compact: true,
    /** External Selah Keep site — shown after RSS in the public footer. */
    skUrl: "https://selahkeep.com",
  },
} as const;

export function getPublicSiteTitle(config: BlogConfig): string {
  return PUBLIC_SITE_CONFIG.siteTitle || config.title;
}

export function getPublicSiteDescription(config: BlogConfig): string {
  return PUBLIC_SITE_CONFIG.siteDescription || config.description;
}
