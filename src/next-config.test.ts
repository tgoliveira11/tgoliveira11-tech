import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("Next public deployment configuration", () => {
  it("redirects the apex hostname to the canonical www origin", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/:path*",
          destination: "https://www.tgoliveira11.tech/:path*",
          permanent: true,
          has: [expect.objectContaining({ type: "host", value: "tgoliveira11.tech" })],
        }),
      ])
    );
  });

  it("keeps strategic redirects permanent and loop-free", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/blog/software-solution-system-architecture",
          destination: "/blog/2023-06-16-software-solution-system-architecture",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/categories/technology-architecture",
          destination: "/categories/software-solution-architecture",
          permanent: true,
        }),
        expect.objectContaining({
          source: "/blog/building-scaling-b2b-mobility-platform",
          destination:
            "/blog/2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
          permanent: true,
        }),
        expect.objectContaining({
          source:
            "/blog/2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
          destination:
            "/blog/2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform",
          permanent: true,
        }),
      ])
    );
    expect(redirects.every((redirect) => redirect.source !== redirect.destination)).toBe(true);
  });

  it("prevents caching public HTML and content-bearing feeds", async () => {
    const headers = (await nextConfig.headers?.()) ?? [];

    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/about",
          headers: [
            expect.objectContaining({
              key: "Cache-Control",
              value: expect.stringContaining("no-store"),
            }),
          ],
        }),
        expect.objectContaining({
          source: "/rss.xml",
          headers: [
            expect.objectContaining({
              key: "Cache-Control",
              value: expect.stringContaining("no-store"),
            }),
          ],
        }),
        expect.objectContaining({
          source: "/llms-full.txt",
          headers: [
            expect.objectContaining({
              key: "Cache-Control",
              value: expect.stringContaining("no-store"),
            }),
          ],
        }),
      ])
    );
  });
});
