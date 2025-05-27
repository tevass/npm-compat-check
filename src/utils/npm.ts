import npa from "npm-package-arg";
import fetch from "npm-registry-fetch";
import semver from "semver";

import {
  type PackageName,
  type PackageRelease,
  packageReleaseSchema,
} from "../types";

const packageReleasesSchema = packageReleaseSchema.array();

export function parseVersion(version: string) {
  const parsed = semver.valid(semver.coerce(version));

  if (!parsed) {
    throw new Error(`Invalid version: ${version}`);
  }

  return parsed;
}

export function hasValidVersion(version: string) {
  return !!semver.valid(semver.coerce(version));
}

export function parsePackageName(name: string) {
  const pkg = npa(name);

  if (!pkg.name) {
    throw new Error("Invalid package name");
  }

  return pkg as PackageName;
}

export async function fetchStableVersions(packageName: string) {
  const response = await fetch.json(packageName);
  if (!response.versions) {
    throw new Error(`Package ${packageName} not found`);
  }

  const versions = Object.keys(response.versions)
    .filter((version) => !semver.prerelease(version))
    .reverse();

  return versions;
}

export async function fetchStableReleases(
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

  const releases = packageReleasesSchema.parse(items);

  return releases;
}

export async function getPackageVersion(packageName: PackageName) {
  try {
    const response = await fetch.json(
      `${packageName.name}/${packageName.fetchSpec}`,
    );
    return response.version as string;
  } catch (error) {
    return null;
  }
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

export function resolveLatestOrPackageVersion(pkg: npa.Result): string {
  return "";
}
