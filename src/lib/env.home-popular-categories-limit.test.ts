import { afterEach, describe, expect, it } from "vitest";
import { readHomePopularCategoriesLimit } from "@/lib/env";

describe("readHomePopularCategoriesLimit", () => {
  const original = process.env.HOME_POPULAR_CATEGORIES_LIMIT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.HOME_POPULAR_CATEGORIES_LIMIT;
    } else {
      process.env.HOME_POPULAR_CATEGORIES_LIMIT = original;
    }
  });

  it("defaults to 6 when unset", () => {
    delete process.env.HOME_POPULAR_CATEGORIES_LIMIT;
    expect(readHomePopularCategoriesLimit()).toBe(6);
  });

  it("uses env override", () => {
    process.env.HOME_POPULAR_CATEGORIES_LIMIT = "3";
    expect(readHomePopularCategoriesLimit()).toBe(3);
  });

  it("falls back to 6 for invalid values", () => {
    process.env.HOME_POPULAR_CATEGORIES_LIMIT = "0";
    expect(readHomePopularCategoriesLimit()).toBe(6);
    process.env.HOME_POPULAR_CATEGORIES_LIMIT = "abc";
    expect(readHomePopularCategoriesLimit()).toBe(6);
  });

  it("caps limit at 24", () => {
    process.env.HOME_POPULAR_CATEGORIES_LIMIT = "100";
    expect(readHomePopularCategoriesLimit()).toBe(24);
  });
});
