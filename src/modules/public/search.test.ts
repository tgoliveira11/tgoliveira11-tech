import { describe, expect, it } from "vitest";
import {
  buildPublicSearchPath,
  formatSearchResultLabel,
  hasSearchQuery,
  normalizeSearchQuery,
  PUBLIC_SEARCH_PATH,
} from "@/modules/public/search";

describe("public search helpers", () => {
  it("builds the search query path", () => {
    expect(buildPublicSearchPath("hello world")).toBe(`${PUBLIC_SEARCH_PATH}?q=hello+world`);
    expect(buildPublicSearchPath("  trimmed  ")).toBe(`${PUBLIC_SEARCH_PATH}?q=trimmed`);
    expect(buildPublicSearchPath("   ")).toBe(PUBLIC_SEARCH_PATH);
  });

  it("normalizes and detects search queries", () => {
    expect(normalizeSearchQuery("  hello  ")).toBe("hello");
    expect(normalizeSearchQuery(undefined)).toBe("");
    expect(hasSearchQuery("test")).toBe(true);
    expect(hasSearchQuery("   ")).toBe(false);
    expect(hasSearchQuery(null)).toBe(false);
  });

  it("formats result labels with correct pluralization", () => {
    expect(formatSearchResultLabel(1, "nextjs")).toBe('1 result for "nextjs"');
    expect(formatSearchResultLabel(3, "ai")).toBe('3 results for "ai"');
  });
});
