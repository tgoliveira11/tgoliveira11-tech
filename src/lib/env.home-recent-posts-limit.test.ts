import { afterEach, describe, expect, it } from "vitest";
import { readHomeRecentPostsLimit } from "@/lib/env";

describe("readHomeRecentPostsLimit", () => {
  const original = process.env.HOME_RECENT_POSTS_LIMIT;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.HOME_RECENT_POSTS_LIMIT;
    } else {
      process.env.HOME_RECENT_POSTS_LIMIT = original;
    }
  });

  it("defaults to 12 when unset", () => {
    delete process.env.HOME_RECENT_POSTS_LIMIT;
    expect(readHomeRecentPostsLimit()).toBe(12);
  });

  it("uses env override", () => {
    process.env.HOME_RECENT_POSTS_LIMIT = "8";
    expect(readHomeRecentPostsLimit()).toBe(8);
  });

  it("falls back to 12 for invalid values", () => {
    process.env.HOME_RECENT_POSTS_LIMIT = "0";
    expect(readHomeRecentPostsLimit()).toBe(12);
    process.env.HOME_RECENT_POSTS_LIMIT = "abc";
    expect(readHomeRecentPostsLimit()).toBe(12);
  });

  it("caps limit at 48", () => {
    process.env.HOME_RECENT_POSTS_LIMIT = "100";
    expect(readHomeRecentPostsLimit()).toBe(48);
  });
});
