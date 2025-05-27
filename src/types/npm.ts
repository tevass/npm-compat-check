import type npa from "npm-package-arg";
import type { SetNonNullable } from "type-fest";

export type PackageName = SetNonNullable<npa.Result, "name">;
