import { z } from "zod";

export const packageReleaseSchema = z.object({
  version: z.string(),
  dependencies: z.record(z.string(), z.string()).default({}),
  peerDependencies: z.record(z.string(), z.string()).default({}),
});

export type PackageRelease = z.infer<typeof packageReleaseSchema>;
