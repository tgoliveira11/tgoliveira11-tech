import { afterEach, describe, expect, it } from "vitest";
import { readPublicPostsPageSize } from "@/lib/env";

describe("readPublicPostsPageSize", () => {
  const original = process.env.PUBLIC_POSTS_PAGE_SIZE;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.PUBLIC_POSTS_PAGE_SIZE;
    } else {
      process.env.PUBLIC_POSTS_PAGE_SIZE = original;
    }
  });

  it("defaults to 5 when unset", () => {
    delete process.env.PUBLIC_POSTS_PAGE_SIZE;
    expect(readPublicPostsPageSize()).toBe(5);
  });

  it("uses env override", () => {
    process.env.PUBLIC_POSTS_PAGE_SIZE = "10";
    expect(readPublicPostsPageSize()).toBe(10);
  });

  it("falls back to 5 for invalid values", () => {
    process.env.PUBLIC_POSTS_PAGE_SIZE = "0";
    expect(readPublicPostsPageSize()).toBe(5);
    process.env.PUBLIC_POSTS_PAGE_SIZE = "abc";
    expect(readPublicPostsPageSize()).toBe(5);
  });

  it("caps page size at 50", () => {
    process.env.PUBLIC_POSTS_PAGE_SIZE = "100";
    expect(readPublicPostsPageSize()).toBe(50);
  });
});
