import type { ReactNode } from "react";
import { GoogleAnalytics } from "@/components/public/google-analytics";
import { getBlogConfig } from "@/modules/public/blog-config";
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from "@/modules/public/google-analytics";
import { buildSiteMetadata, buildWebsiteJsonLd, stringifyJsonLd } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return buildSiteMetadata(config);
}

export default async function PublicGroupLayout({ children }: { children: ReactNode }) {
  const config = await getBlogConfig();
  const jsonLd = buildWebsiteJsonLd(config);

  return (
    <>
      <GoogleAnalytics
        measurementId={GOOGLE_ANALYTICS_MEASUREMENT_ID}
        enabled={config.analyticsEnabled}
      />
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
    </>
  );
}
