import { describe, expect, it } from "vitest";
import { SITE_BRAND, SITE_BRAND_ICONS } from "./site-brand";

describe("site-brand", () => {
  it("points to repo-local profile and generated brand assets", () => {
    expect(SITE_BRAND.profileSourceImage).toBe("/images/about/thiago-oliveira.jpg");
    expect(SITE_BRAND.assetsPath).toBe("/images/brand");
  });

  it("defines favicon metadata for optional layout wiring", () => {
    expect(SITE_BRAND_ICONS.shortcut).toBe("/images/brand/favicon.ico");
    expect(SITE_BRAND_ICONS.icon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "/images/brand/favicon-32.png", sizes: "32x32" }),
      ])
    );
    expect(SITE_BRAND_ICONS.apple).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "/images/brand/apple-icon.png", sizes: "180x180" }),
      ])
    );
  });
});
