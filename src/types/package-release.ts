import { z } from "zod/v4";

export const packageReleaseSchema = z.object({
  version: z.string(),
  dependencies: z.record(z.string(), z.string()).default({}),
  peerDependencies: z.record(z.string(), z.string()).default({}),
  devDependencies: z.record(z.string(), z.string()).default({}),
});

export type PackageRelease = z.infer<typeof packageReleaseSchema>;
