export type SecurityHeader = {
  key: string;
  value: string;
};

/** Safe default HTTP security headers for public + auth surfaces. */
export function getSecurityHeaders(options?: { includeHsts?: boolean }): SecurityHeader[] {
  const includeHsts =
    options?.includeHsts ?? process.env.NODE_ENV === "production";

  const headers: SecurityHeader[] = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
      key: "X-DNS-Prefetch-Control",
      value: "on",
    },
  ];

  if (includeHsts) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}
