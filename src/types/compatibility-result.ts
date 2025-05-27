import { z } from "zod/v4";

export const compatibilityResultSchema = z.discriminatedUnion(
  "hasCompatibility",
  [
    z.object({
      version: z.string(),
      hasCompatibility: z.literal(false),
      reason: z.enum(["version-mismatch", "not-found"]),
    }),
    z.object({
      version: z.string(),
      hasCompatibility: z.literal(true),
    }),
  ],
);

export type CompatibilityResult = z.infer<typeof compatibilityResultSchema>;
