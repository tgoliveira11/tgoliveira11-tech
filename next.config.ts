import type { NextConfig } from "next";

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
