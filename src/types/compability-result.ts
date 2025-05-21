import { z } from "zod";

export const compatibilityResultSchema = z.discriminatedUnion("isCompatible", [
  z.object({
    version: z.string(),
    isCompatible: z.literal(false),
    reason: z.enum(["version-mismatch", "not-found"]),
  }),
  z.object({
    version: z.string(),
    isCompatible: z.literal(true),
  }),
]);

export type CompatibilityResult = z.infer<typeof compatibilityResultSchema>;
