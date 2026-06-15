const MAX_TAXONOMY_NAME_LENGTH = 120;

export function normalizeTaxonomyName(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function isValidTaxonomyName(input: string): boolean {
  const normalized = normalizeTaxonomyName(input);
  return normalized.length > 0 && normalized.length <= MAX_TAXONOMY_NAME_LENGTH;
}

export function taxonomyNamesMatch(a: string, b: string): boolean {
  return normalizeTaxonomyName(a).toLowerCase() === normalizeTaxonomyName(b).toLowerCase();
}
