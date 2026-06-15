import { describe, expect, it, vi, beforeEach } from "vitest";
import { ConflictError } from "@/lib/errors";
import {
  isValidTaxonomyName,
  normalizeTaxonomyName,
  taxonomyNamesMatch,
} from "@/modules/taxonomy/taxonomy-name";
import * as taxonomyService from "@/modules/taxonomy/taxonomy.service";

vi.mock("@/modules/tags/tags.repository", () => ({
  findTagBySlug: vi.fn(),
  findTagByNameCaseInsensitive: vi.fn(),
  searchTagsByName: vi.fn(),
}));

vi.mock("@/modules/tags/tags.service", () => ({
  createTag: vi.fn(),
}));

vi.mock("@/modules/categories/categories.repository", () => ({
  findCategoryBySlug: vi.fn(),
  findCategoryByNameCaseInsensitive: vi.fn(),
  searchCategoriesByName: vi.fn(),
}));

vi.mock("@/modules/categories/categories.service", () => ({
  createCategory: vi.fn(),
}));

import * as tagsRepo from "@/modules/tags/tags.repository";
import * as tagsService from "@/modules/tags/tags.service";
import * as categoriesRepo from "@/modules/categories/categories.repository";
import * as categoriesService from "@/modules/categories/categories.service";

const sampleTag = {
  id: "tag-1",
  name: "Next.js",
  slug: "nextjs",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleCategory = {
  id: "cat-1",
  name: "Engineering",
  slug: "engineering",
  description: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("taxonomy name helpers", () => {
  it("normalizes whitespace and repeated spaces", () => {
    expect(normalizeTaxonomyName("  nextjs   architecture  ")).toBe("nextjs architecture");
  });

  it("rejects empty names", () => {
    expect(isValidTaxonomyName("   ")).toBe(false);
  });

  it("matches names case-insensitively", () => {
    expect(taxonomyNamesMatch("NextJS", "nextjs")).toBe(true);
  });
});

describe("taxonomy.service findOrCreate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("reuses an existing tag by slug", async () => {
    vi.mocked(tagsRepo.findTagBySlug).mockResolvedValue(sampleTag);

    const result = await taxonomyService.findOrCreateTag("nextjs");

    expect(result.item).toEqual(sampleTag);
    expect(result.created).toBe(false);
    expect(tagsService.createTag).not.toHaveBeenCalled();
  });

  it("reuses an existing tag by case-insensitive name", async () => {
    vi.mocked(tagsRepo.findTagBySlug).mockResolvedValue(undefined);
    vi.mocked(tagsRepo.findTagByNameCaseInsensitive).mockResolvedValue(sampleTag);

    const result = await taxonomyService.findOrCreateTag("Next.js");

    expect(result.item).toEqual(sampleTag);
    expect(result.created).toBe(false);
  });

  it("creates a tag when none exists", async () => {
    vi.mocked(tagsRepo.findTagBySlug).mockResolvedValue(undefined);
    vi.mocked(tagsRepo.findTagByNameCaseInsensitive).mockResolvedValue(undefined);
    vi.mocked(tagsService.createTag).mockResolvedValue(sampleTag);

    const result = await taxonomyService.findOrCreateTag("nextjs");

    expect(tagsService.createTag).toHaveBeenCalledWith({ name: "nextjs" });
    expect(result.created).toBe(true);
  });

  it("reuses tag after create conflict", async () => {
    vi.mocked(tagsRepo.findTagBySlug)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(sampleTag);
    vi.mocked(tagsRepo.findTagByNameCaseInsensitive).mockResolvedValue(undefined);
    vi.mocked(tagsService.createTag).mockRejectedValue(new ConflictError("Tag slug already exists"));

    const result = await taxonomyService.findOrCreateTag("nextjs");

    expect(result.item).toEqual(sampleTag);
    expect(result.created).toBe(false);
  });

  it("reuses category by slug and creates when missing", async () => {
    vi.mocked(categoriesRepo.findCategoryBySlug).mockResolvedValueOnce(sampleCategory);
    let categoryResult = await taxonomyService.findOrCreateCategory("Engineering");
    expect(categoryResult.created).toBe(false);

    vi.mocked(categoriesRepo.findCategoryBySlug).mockResolvedValue(undefined);
    vi.mocked(categoriesRepo.findCategoryByNameCaseInsensitive).mockResolvedValue(undefined);
    vi.mocked(categoriesService.createCategory).mockResolvedValue(sampleCategory);

    categoryResult = await taxonomyService.findOrCreateCategory("Engineering");
    expect(categoriesService.createCategory).toHaveBeenCalledWith({ name: "Engineering" });
    expect(categoryResult.created).toBe(true);
  });
});
