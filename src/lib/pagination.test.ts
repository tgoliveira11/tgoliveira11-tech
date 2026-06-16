import { describe, expect, it } from "vitest";
import { buildPaginatedResult, normalizePage } from "@/lib/pagination";

describe("pagination helpers", () => {
  it("normalizes invalid pages to 1", () => {
    expect(normalizePage(undefined)).toBe(1);
    expect(normalizePage("0")).toBe(1);
    expect(normalizePage("-2")).toBe(1);
    expect(normalizePage("abc")).toBe(1);
  });

  it("normalizes valid pages", () => {
    expect(normalizePage("2")).toBe(2);
    expect(normalizePage(3)).toBe(3);
    expect(normalizePage("2.9")).toBe(2);
  });

  it("builds paginated metadata", () => {
    const result = buildPaginatedResult(["a", "b"], {
      page: 2,
      pageSize: 5,
      totalItems: 12,
    });

    expect(result).toEqual({
      items: ["a", "b"],
      page: 2,
      pageSize: 5,
      totalItems: 12,
      totalPages: 3,
      hasPreviousPage: true,
      hasNextPage: true,
    });
  });

  it("clamps page above total pages", () => {
    const result = buildPaginatedResult([], {
      page: 99,
      pageSize: 5,
      totalItems: 3,
    });

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });
});
