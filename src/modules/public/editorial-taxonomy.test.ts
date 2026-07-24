import { describe, expect, it } from "vitest";
import type { Post } from "@/modules/posts/posts.types";
import {
  canonicalizeCategorySlug,
  canonicalizeTagList,
  canonicalizeTagSlug,
  getCanonicalPostAliasTarget,
  getPostImageAltText,
  resolveEditorialCategoryForPost,
} from "./editorial-taxonomy";

function makePost(slug: string, title = "Post"): Pick<Post, "slug" | "title"> {
  return { slug, title };
}

describe("editorial taxonomy", () => {
  it("canonicalizes legacy tag formats to lowercase kebab-case", () => {
    expect(canonicalizeTagSlug("softwareArchitecture")).toBe("software-architecture");
    expect(canonicalizeTagSlug("solutionArchitecture")).toBe("solution-architecture");
    expect(canonicalizeTagSlug("APIsecurity")).toBe("api-security");
    expect(canonicalizeTagSlug("Text-to-SQL")).toBe("text-to-sql");
    expect(canonicalizeTagSlug("generativeAI")).toBe("generative-ai");
  });

  it("deduplicates canonical tags within a post", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const tags = canonicalizeTagList([
      { id: "1", name: "softwareArchitecture", slug: "softwarearchitecture", createdAt: now, updatedAt: now },
      { id: "2", name: "software-architecture", slug: "software-architecture", createdAt: now, updatedAt: now },
    ]);

    expect(tags).toHaveLength(1);
    expect(tags[0]?.slug).toBe("software-architecture");
  });

  it("canonicalizes legacy category slugs", () => {
    expect(canonicalizeCategorySlug("technology-architecture")).toBe(
      "software-solution-architecture"
    );
    expect(canonicalizeCategorySlug("technology-leadership")).toBe(
      "engineering-leadership"
    );
    expect(canonicalizeCategorySlug("personal-development")).toBe("career-reflections");
  });

  it("classifies priority articles into editorial categories", () => {
    expect(
      resolveEditorialCategoryForPost(
        makePost("2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production"),
        null,
        []
      ).slug
    ).toBe("ai-engineering");

    expect(
      resolveEditorialCategoryForPost(
        makePost("2023-06-16-software-solution-system-architecture"),
        null,
        []
      ).slug
    ).toBe("software-solution-architecture");

    expect(
      resolveEditorialCategoryForPost(makePost("2024-10-08-a-letter-to-my-past-self"), null, [])
        .slug
    ).toBe("career-reflections");
  });

  it("uses tag rules when a post has no explicit override", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const category = resolveEditorialCategoryForPost(makePost("agent-observability"), null, [
      { id: "tag-1", name: "agenticSystems", slug: "agenticsystems", createdAt: now, updatedAt: now },
    ]);

    expect(category.slug).toBe("ai-engineering");
  });

  it("maps strategic post aliases to current canonical live slugs", () => {
    expect(getCanonicalPostAliasTarget("software-solution-system-architecture")).toBe(
      "2023-06-16-software-solution-system-architecture"
    );
    expect(getCanonicalPostAliasTarget("2023-06-16-software-solution-system-architecture")).toBeNull();
    expect(getCanonicalPostAliasTarget("2026-07-24-text-to-sql-from-demo-to-production")).toBe(
      "2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production"
    );
    expect(getCanonicalPostAliasTarget("2026-07-25-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform")).toBe(
      "2026-07-24-from-concept-to-commercialization-building-and-scaling-a-b2b-mobility-platform"
    );
    expect(getCanonicalPostAliasTarget("unknown")).toBeNull();
  });

  it("uses priority article alt text before falling back to the title", () => {
    expect(
      getPostImageAltText(
        makePost("2026-07-24-what-breaks-first-when-text-to-sql-moves-from-demo-to-production"),
        ""
      )
    ).toContain("Text-to-SQL system");
    expect(getPostImageAltText(makePost("plain-post", "Plain Post"), null)).toBe("Plain Post");
    expect(getPostImageAltText(makePost("plain-post", "Plain Post"), "Existing alt")).toBe(
      "Existing alt"
    );
  });
});
