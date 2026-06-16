import { describe, expect, it } from "vitest";
import {
  buildAdminPostOrderBy,
  buildFlagsOrderBy,
  compareDefaultAdminPostOrder,
  DEFAULT_ADMIN_POST_ORDER,
  DEFAULT_ADMIN_POST_ORDER_SQL,
  getAdminPostsDefaultOrderBy,
  sortPostsByDefaultAdminOrder,
  type AdminDefaultSortPost,
} from "@/modules/posts/posts.repository.admin-sort";

function makePost(overrides: Partial<AdminDefaultSortPost> & { id: string }): AdminDefaultSortPost & {
  id: string;
} {
  return {
    publicOrder: null,
    publishedAt: null,
    updatedAt: new Date("2026-06-16T00:00:00Z"),
    ...overrides,
  };
}

describe("admin post order by", () => {
  it("uses default admin sort when no sort is provided", () => {
    expect(buildAdminPostOrderBy({})).toEqual(DEFAULT_ADMIN_POST_ORDER);
    expect(getAdminPostsDefaultOrderBy()).toHaveLength(5);
  });

  it("documents explicit CASE-based default ordering without IS NOT NULL ASC grouping", () => {
    expect(DEFAULT_ADMIN_POST_ORDER_SQL).toHaveLength(5);
    expect(DEFAULT_ADMIN_POST_ORDER_SQL[0]).toContain("CASE");
    expect(DEFAULT_ADMIN_POST_ORDER_SQL[0]).toContain("THEN 0");
    expect(DEFAULT_ADMIN_POST_ORDER_SQL.join("\n")).not.toMatch(
      /public_order IS NOT NULL ASC/
    );
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

  it("sorts public order with null publicOrder rows first when column is selected", () => {
    const defaultOrder = getAdminPostsDefaultOrderBy();
    const explicitOrder = buildAdminPostOrderBy({ sort: "publicOrder", direction: "asc" });
    expect(explicitOrder.length).toBe(3);
    expect(explicitOrder).not.toEqual(defaultOrder);
  });
});

describe("default admin post ordering rules", () => {
  const postA = makePost({
    id: "A",
    publishedAt: new Date("2026-06-16T04:00:00Z"),
    updatedAt: new Date("2026-06-16T04:30:00Z"),
  });
  const postB = makePost({
    id: "B",
    updatedAt: new Date("2026-06-16T05:00:00Z"),
  });
  const postC = makePost({
    id: "C",
    publicOrder: 1,
    publishedAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
  });
  const postD = makePost({
    id: "D",
    publicOrder: 2,
    publishedAt: new Date("2026-06-01T00:00:00Z"),
    updatedAt: new Date("2026-06-01T00:00:00Z"),
  });
  const postE = makePost({
    id: "E",
    publishedAt: new Date("2026-06-17T01:00:00Z"),
    updatedAt: new Date("2026-06-17T01:00:00Z"),
  });

  it("places publicOrder = null records before non-null records", () => {
    expect(compareDefaultAdminPostOrder(postA, postC)).toBeLessThan(0);
    expect(compareDefaultAdminPostOrder(postC, postA)).toBeGreaterThan(0);
  });

  it("sorts null public order records by publishedAt DESC when available", () => {
    expect(compareDefaultAdminPostOrder(postE, postA)).toBeLessThan(0);
  });

  it("sorts null public order records without publishedAt by updatedAt DESC", () => {
    expect(compareDefaultAdminPostOrder(postA, postB)).toBeLessThan(0);
  });

  it("sorts non-null public order records by publicOrder ASC after all nulls", () => {
    expect(compareDefaultAdminPostOrder(postC, postD)).toBeLessThan(0);
  });

  it("orders the documented example set as E, A, B, C, D", () => {
    const ordered = sortPostsByDefaultAdminOrder([postD, postB, postA, postE, postC]);
    expect(ordered.map((post) => post.id)).toEqual(["E", "A", "B", "C", "D"]);
  });
});
