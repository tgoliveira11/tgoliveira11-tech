import { z } from "zod";

export const importFromUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .url("Enter a valid http or https URL"),
  createRedirect: z.boolean().default(false),
});

export type ImportFromUrlInput = z.infer<typeof importFromUrlSchema>;
