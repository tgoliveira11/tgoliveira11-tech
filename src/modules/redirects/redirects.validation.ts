import { z } from "zod";

export const createRedirectSchema = z.object({
  sourcePath: z
    .string()
    .min(1)
    .refine((value) => value.startsWith("/"), { message: "sourcePath must start with /" }),
  targetPath: z
    .string()
    .min(1)
    .refine((value) => value.startsWith("/"), { message: "targetPath must start with /" }),
  statusCode: z.number().int().min(300).max(399).default(301),
});

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
