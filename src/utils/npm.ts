import npa from "npm-package-arg";
import fetch from "npm-registry-fetch";
import semver from "semver";
import type { SetNonNullable } from "type-fest";

import { type PackageRelease, packageReleaseSchema } from "../types";

const packageReleasesSchema = packageReleaseSchema.array();

export function validVersion(version: string) {
  return semver.valid(semver.coerce(version));
}

export function parsePackageName(name: string) {
  const pkg = npa(name);

  if (!pkg.name) {
    throw new Error("Invalid package name");
  }

  return pkg as SetNonNullable<npa.Result, "name">;
}

export async function fetchStableVersions(
  packageName: string,
): Promise<PackageRelease[]> {
  const response = await fetch.json(packageName);
  if (!response.versions) {
    throw new Error(`Package ${packageName} not found`);
  }

  const items = Object.entries(response.versions)
    .filter(([version]) => !semver.prerelease(version))
    .map(([_, release]) => release)
    .reverse();

  const versions = packageReleasesSchema.parse(items);

  return versions;
}

export async function getLatestStableVersion(packageName: string) {
  const response = await fetch.json(packageName);
  if (!response.versions) {
    throw new Error(`Package ${packageName} not found`);
  }

  const latest = (Object.keys(response.versions) as string[])
    .filter((version) => !semver.prerelease(version))
    .reverse()
    .at(0);

  const version = semver.valid(semver.coerce(latest));

  if (!latest || !version) {
    throw new Error(`Latest stable version of ${packageName} not found`);
  }

  return version;
}
