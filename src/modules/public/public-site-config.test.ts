import { describe, expect, it } from "vitest";
import {
  getPublicSiteDescription,
  getPublicSiteTitle,
  PUBLIC_SITE_CONFIG,
} from "./public-site-config";

describe("public site config", () => {
  it("exposes repo-specific header and footer settings", () => {
    expect(PUBLIC_SITE_CONFIG.siteTitle).toBe("Thiago Goulart de Oliveira");
    expect(PUBLIC_SITE_CONFIG.footer.compact).toBe(true);
  });

  it("returns configured site title override", () => {
    expect(getPublicSiteTitle({ title: "Blog", description: "", baseUrl: "", postsPerPage: 12, rssEnabled: true, analyticsEnabled: true, defaultSeoImage: null })).toBe(
      "Thiago Goulart de Oliveira"
    );
  });

  it("returns configured site description override", () => {
    expect(
      getPublicSiteDescription({
        title: "Blog",
        description: "Generic blog",
        baseUrl: "",
        postsPerPage: 12,
        rssEnabled: true,
        analyticsEnabled: true,
        defaultSeoImage: null,
      })
    ).toContain("production AI systems");
  });
});
