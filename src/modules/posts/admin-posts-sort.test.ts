import { describe, expect, it } from "vitest";
import {
  adminSortIndicator,
  buildAdminPostsSortHref,
  parseAdminPostsSortInput,
} from "@/modules/posts/admin-posts-sort";

describe("admin posts sort helpers", () => {
  it("uses default sort when query params are missing", () => {
    expect(parseAdminPostsSortInput({})).toEqual({ usesDefaultSort: true });
  });

  it("parses sort and direction from query params", () => {
    expect(parseAdminPostsSortInput({ sort: "title", direction: "desc" })).toEqual({
      sort: "title",
      direction: "desc",
      usesDefaultSort: false,
    });
  });

  it("defaults direction to asc for invalid values", () => {
    expect(parseAdminPostsSortInput({ sort: "status", direction: "sideways" })).toEqual({
      sort: "status",
      direction: "asc",
      usesDefaultSort: false,
    });
  });

  it("builds sort href toggling direction for the active column", () => {
    expect(
      buildAdminPostsSortHref({
        column: "title",
        currentSort: "title",
        currentDirection: "asc",
        filters: { status: "published", search: "hello" },
      })
    ).toBe("/admin/posts?status=published&search=hello&sort=title&direction=desc");
  });

  it("shows default indicator on public order when using default sort", () => {
    expect(
      adminSortIndicator({
        column: "publicOrder",
        usesDefaultSort: true,
      })
    ).toBe("default");
  });
});
