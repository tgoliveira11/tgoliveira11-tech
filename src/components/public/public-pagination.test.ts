import { describe, expect, it } from "vitest";

function buildHref(basePath: string, targetPage: number, query?: Record<string, string>) {
  const params = new URLSearchParams(query);
  if (targetPage > 1) {
    params.set("page", String(targetPage));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

describe("public pagination links", () => {
  it("builds page 1 without query param", () => {
    expect(buildHref("/blog", 1)).toBe("/blog");
    expect(buildHref("/", 1)).toBe("/");
  });

  it("builds later pages with page query", () => {
    expect(buildHref("/blog", 2)).toBe("/blog?page=2");
    expect(buildHref("/", 3)).toBe("/?page=3");
  });

  it("preserves other query params", () => {
    expect(buildHref("/blog", 2, { q: "next" })).toBe("/blog?q=next&page=2");
  });
});
