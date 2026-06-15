import { z } from "zod";
import { isValidTaxonomyName, normalizeTaxonomyName } from "./taxonomy-name";

export const taxonomyQuerySchema = z
  .string()
  .max(120)
  .transform((value) => normalizeTaxonomyName(value));

export const taxonomyNameSchema = z
  .string()
  .transform((value) => normalizeTaxonomyName(value))
  .refine((value) => isValidTaxonomyName(value), {
    message: "Name must be between 1 and 120 characters",
  });
