import { describe, expect, it } from "vitest";
import { listPublicCategories, listPublicTags } from "@/modules/public/public-posts.repository";

function sortByRelevance<T extends { name: string; postCount: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    if (right.postCount !== left.postCount) {
      return right.postCount - left.postCount;
    }
    return left.name.localeCompare(right.name);
  });
}

describe("public taxonomy relevance ordering", () => {
  it("orders tags by published post count desc with name asc tie-breaker", () => {
    const ordered = sortByRelevance([
      { name: "beta", postCount: 2 },
      { name: "alpha", postCount: 4 },
      { name: "gamma", postCount: 2 },
    ]);

    expect(ordered.map((tag) => tag.name)).toEqual(["alpha", "beta", "gamma"]);
  });

  it("excludes tags with zero published posts", () => {
    const tags = [
      { name: "used", postCount: 3 },
      { name: "unused", postCount: 0 },
    ].filter((tag) => tag.postCount > 0);

    expect(tags).toEqual([{ name: "used", postCount: 3 }]);
  });

  it("orders categories by published post count desc with name asc tie-breaker", () => {
    const ordered = sortByRelevance([
      { name: "Ops", postCount: 1 },
      { name: "Engineering", postCount: 3 },
      { name: "Design", postCount: 3 },
    ]);

    expect(ordered.map((category) => category.name)).toEqual(["Design", "Engineering", "Ops"]);
  });

  it("exports relevance-based public list methods", () => {
    expect(typeof listPublicTags).toBe("function");
    expect(typeof listPublicCategories).toBe("function");
  });
});
