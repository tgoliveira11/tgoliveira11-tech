import type { ReactNode } from "react";
import { getBlogConfig } from "@/modules/public/blog-config";
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
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(jsonLd) }}
      />
    </>
  );
}
