import { describe, expect, it } from "vitest";
import { getPublicSiteTitle, PUBLIC_SITE_CONFIG } from "./public-site-config";

describe("public site config", () => {
  it("exposes repo-specific header and footer settings", () => {
    expect(PUBLIC_SITE_CONFIG.siteTitle).toBe("tgoliveira11 Tech");
    expect(PUBLIC_SITE_CONFIG.footer.skUrl).toBe("https://selahkeep.com");
  });

  it("returns configured site title override", () => {
    expect(getPublicSiteTitle({ title: "Blog", description: "", baseUrl: "", postsPerPage: 12, rssEnabled: true, analyticsEnabled: true, defaultSeoImage: null })).toBe(
      "tgoliveira11 Tech"
    );
  });
});
