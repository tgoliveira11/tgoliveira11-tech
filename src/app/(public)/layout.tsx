import type { ReactNode } from "react";
import { getBlogConfig } from "@/modules/public/blog-config";
import { buildSiteMetadata } from "@/modules/public/seo";

export async function generateMetadata() {
  const config = await getBlogConfig();
  return buildSiteMetadata(config);
}

export default async function PublicGroupLayout({ children }: { children: ReactNode }) {
  return children;
}
