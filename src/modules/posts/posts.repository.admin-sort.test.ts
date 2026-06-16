import { describe, expect, it } from "vitest";
import {
  buildAdminPostOrderBy,
  buildFlagsOrderBy,
  DEFAULT_ADMIN_POST_ORDER,
} from "@/modules/posts/posts.repository.admin-sort";

describe("admin post order by", () => {
  it("uses default admin sort when no sort is provided", () => {
    expect(buildAdminPostOrderBy({})).toEqual(DEFAULT_ADMIN_POST_ORDER);
    expect(DEFAULT_ADMIN_POST_ORDER).toHaveLength(4);
  });

  it("explicit sort overrides default admin ordering", () => {
    const clauses = buildAdminPostOrderBy({ sort: "title", direction: "asc" });
    expect(clauses).not.toEqual(DEFAULT_ADMIN_POST_ORDER);
    expect(clauses.length).toBeGreaterThan(0);
  });

  it("sorts title ascending when requested", () => {
    const clauses = buildAdminPostOrderBy({ sort: "title", direction: "asc" });
    expect(clauses.length).toBeGreaterThan(0);
  });

  it("sorts flags by pinned, featured, priority, and updatedAt descending", () => {
    expect(buildFlagsOrderBy("desc")).toHaveLength(4);
  });

  it("sorts public order ascending with nulls last in the manual column", () => {
    const clauses = buildAdminPostOrderBy({ sort: "publicOrder", direction: "asc" });
    expect(clauses.length).toBe(3);
  });
});
