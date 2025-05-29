import type npa from "npm-package-arg";
import type { SetNonNullable } from "type-fest";

export type RawPackageName = SetNonNullable<npa.Result, "name">;

export interface PackageName {
  name: string;
  version: string;
  raw: string;
}
