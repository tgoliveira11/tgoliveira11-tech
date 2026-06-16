import type { TaxonomyActionResult } from "@/modules/tags/admin-tags.actions";

export function shouldCompleteTaxonomyEdit(
  editing: boolean,
  state: TaxonomyActionResult
): boolean {
  return editing && state.ok === true && Boolean(state.message) && !state.error;
}
