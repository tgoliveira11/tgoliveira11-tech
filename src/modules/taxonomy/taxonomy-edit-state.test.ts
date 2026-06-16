import { describe, expect, it } from "vitest";
import { shouldCompleteTaxonomyEdit } from "@/modules/taxonomy/taxonomy-edit-state";

describe("taxonomy edit state", () => {
  it("completes edit only for the active editing row with a success message", () => {
    expect(
      shouldCompleteTaxonomyEdit(true, { ok: true, message: "Tag updated" })
    ).toBe(true);
    expect(
      shouldCompleteTaxonomyEdit(false, { ok: true, message: "Tag updated" })
    ).toBe(false);
    expect(shouldCompleteTaxonomyEdit(true, { ok: false, error: "Duplicate" })).toBe(false);
  });
});
