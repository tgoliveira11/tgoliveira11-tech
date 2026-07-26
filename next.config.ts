import type { NextConfig } from "next";
import { getSecurityHeaders } from "./src/lib/security/http-security-headers";

const CANONICAL_ORIGIN = "https://www.tgoliveira11.tech";
const APEX_HOST = "tgoliveira11.tech";

const publicHtmlCacheHeader = {
  key: "Cache-Control",
  value: "private, no-cache, no-store, max-age=0, must-revalidate",
};

const publicMetadataCacheHeader = {
  key: "Cache-Control",
  value: "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
};

const mobilityPlatformCanonicalPath =
  "/blog/2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform";

const strategicPostRedirects = [
  {
    source: "/blog/software-solution-system-architecture",
    destination: "/blog/2023-06-16-software-solution-system-architecture",
  },
  {
    source: "/software-solution-system-architecture",
    destination: "/blog/2023-06-16-software-solution-system-architecture",
  },
  {
    source: "/blog/a-letter-to-my-past-self",
    destination: "/blog/2024-10-08-a-letter-to-my-past-self",
  },
  {
    source: "/a-letter-to-my-past-self",
    destination: "/blog/2024-10-08-a-letter-to-my-past-self",
  },
  {
    source: "/blog/text-to-sql-from-demo-to-production",
    destination:
      "/blog/2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  },
  {
    source: "/text-to-sql-from-demo-to-production",
    destination:
      "/blog/2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  },
  {
    source: "/blog/what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
    destination:
      "/blog/2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  },
  {
    source: "/what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
    destination:
      "/blog/2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production",
  },
  {
    source: "/blog/building-scaling-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source: "/building-scaling-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source: "/blog/building-and-scaling-a-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source: "/building-and-scaling-a-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source:
      "/blog/from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source:
      "/from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source:
      "/blog/2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
  {
    source:
      "/2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
    destination: mobilityPlatformCanonicalPath,
  },
];

const categoryRedirects = [
  {
    source: "/categories/technology-architecture",
    destination: "/categories/software-solution-architecture",
  },
  {
    source: "/categories/software-architecture",
    destination: "/categories/software-solution-architecture",
  },
  {
    source: "/categories/solution-architecture",
    destination: "/categories/software-solution-architecture",
  },
  {
    source: "/categories/system-architecture",
    destination: "/categories/software-solution-architecture",
  },
  {
    source: "/categories/cybersecurity",
    destination: "/categories/software-solution-architecture",
  },
  {
    source: "/categories/web-security",
    destination: "/categories/software-solution-architecture",
  },
  {
    source: "/categories/technology-leadership",
    destination: "/categories/engineering-leadership",
  },
  {
    source: "/categories/leadership",
    destination: "/categories/engineering-leadership",
  },
  {
    source: "/categories/management",
    destination: "/categories/engineering-leadership",
  },
  {
    source: "/categories/technology-strategy",
    destination: "/categories/technology-strategy",
  },
  {
    source: "/categories/product-strategy",
    destination: "/categories/technology-strategy",
  },
  {
    source: "/categories/professional-growth",
    destination: "/categories/career-reflections",
  },
  {
    source: "/categories/personal-development",
    destination: "/categories/career-reflections",
  },
  {
    source: "/categories/reflections",
    destination: "/categories/career-reflections",
  },
  {
    source: "/categories/career",
    destination: "/categories/career-reflections",
  },
].filter((redirect) => redirect.source !== redirect.destination);

const nextConfig: NextConfig = {
  transpilePackages: ["next-auth"],
  serverExternalPackages: ["postgres", "bcryptjs", "@simplewebauthn/server"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
      {
        source: "/",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/about",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/blog/:path*",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/categories/:path*",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/tags/:path*",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/search",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/rss.xml",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/sitemap.xml",
        headers: [publicMetadataCacheHeader],
      },
      {
        source: "/robots.txt",
        headers: [publicMetadataCacheHeader],
      },
      {
        source: "/llms.txt",
        headers: [publicHtmlCacheHeader],
      },
      {
        source: "/llms-full.txt",
        headers: [publicHtmlCacheHeader],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: APEX_HOST }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
      ...strategicPostRedirects.map((redirect) => ({
        ...redirect,
        permanent: true,
      })),
      ...categoryRedirects.map((redirect) => ({
        ...redirect,
        permanent: true,
      })),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/login",
          has: [
            {
              type: "header",
              key: "content-type",
              value: "(.*application/x-www-form-urlencoded.*)",
            },
          ],
          destination: "/api/auth/login/start-form",
        },
        {
          source: "/login/2fa",
          has: [
            {
              type: "header",
              key: "content-type",
              value: "(.*application/x-www-form-urlencoded.*)",
            },
          ],
          destination: "/api/auth/login/verify-2fa-form",
        },
      ],
    };
  },
};

export default nextConfig;
