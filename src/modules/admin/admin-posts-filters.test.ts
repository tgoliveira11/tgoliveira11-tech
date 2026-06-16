import { describe, expect, it } from "vitest";
import {
  ADMIN_POSTS_RESET_PATH,
  buildAdminPostsListFilters,
  formatAdminPostsCountLabel,
  hasActiveAdminPostFilters,
  isValidUuid,
  parseAdminCategoryId,
  parseAdminPostStatus,
  parseAdminTagId,
} from "@/modules/admin/admin-posts-filters";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("admin posts filter helpers", () => {
  it("validates UUIDs", () => {
    expect(isValidUuid(VALID_UUID)).toBe(true);
    expect(isValidUuid("not-a-uuid")).toBe(false);
    expect(isValidUuid("")).toBe(false);
  });

  it("parses post status and ignores invalid values", () => {
    expect(parseAdminPostStatus("published")).toBe("published");
    expect(parseAdminPostStatus("invalid")).toBeUndefined();
    expect(parseAdminPostStatus("")).toBeUndefined();
  });

  it("parses tag and category ids and ignores invalid values", () => {
    expect(parseAdminTagId(VALID_UUID)).toBe(VALID_UUID);
    expect(parseAdminTagId("bad")).toBeUndefined();
    expect(parseAdminTagId("  ")).toBeUndefined();
    expect(parseAdminCategoryId(VALID_UUID)).toBe(VALID_UUID);
    expect(parseAdminCategoryId("bad")).toBeUndefined();
  });

  it("detects active filters", () => {
    expect(hasActiveAdminPostFilters({})).toBe(false);
    expect(hasActiveAdminPostFilters({ search: "hello" })).toBe(true);
    expect(hasActiveAdminPostFilters({ status: "draft" })).toBe(true);
    expect(hasActiveAdminPostFilters({ categoryId: VALID_UUID })).toBe(true);
    expect(hasActiveAdminPostFilters({ tagId: VALID_UUID })).toBe(true);
  });

  it("formats count labels for filtered and unfiltered views", () => {
    expect(formatAdminPostsCountLabel(1, false)).toBe("1 total post");
    expect(formatAdminPostsCountLabel(23, false)).toBe("23 total posts");
    expect(formatAdminPostsCountLabel(1, true)).toBe("1 post found");
    expect(formatAdminPostsCountLabel(12, true)).toBe("12 posts found");
  });

  it("builds list filters with validated ids and status", () => {
    expect(
      buildAdminPostsListFilters({
        status: "published",
        search: "  hello ",
        categoryId: VALID_UUID,
        tagId: VALID_UUID,
        sort: "title",
        direction: "desc",
        limit: 100,
      })
    ).toEqual({
      status: "published",
      search: "hello",
      categoryId: VALID_UUID,
      tagId: VALID_UUID,
      sort: "title",
      direction: "desc",
      limit: 100,
      offset: undefined,
    });
  });

  it("strips invalid filter values when building list filters", () => {
    expect(
      buildAdminPostsListFilters({
        status: "bogus",
        categoryId: "cat-1",
        tagId: "tag-1",
        search: "   ",
      })
    ).toEqual({
      status: undefined,
      search: undefined,
      categoryId: undefined,
      tagId: undefined,
      sort: undefined,
      direction: undefined,
      limit: undefined,
      offset: undefined,
    });
  });

  it("exposes reset path without query params", () => {
    expect(ADMIN_POSTS_RESET_PATH).toBe("/admin/posts");
  });
});
