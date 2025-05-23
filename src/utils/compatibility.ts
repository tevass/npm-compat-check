import semver from "semver";

import type { CompatibilityResult, PackageRelease } from "../types";

interface TargetPackage {
  name: string;
  version: string;
}

export function checkCompatibility(
  target: TargetPackage,
  release: PackageRelease,
): CompatibilityResult {
  const releasePackageVersion =
    release.peerDependencies[target.name] ||
    release.devDependencies[target.name] ||
    release.dependencies[target.name];

  if (!releasePackageVersion) {
    return {
      version: release.version,
      hasCompatibility: false,
      reason: "not-found",
    };
  }

  const hasCompatibility = semver.satisfies(
    target.version,
    releasePackageVersion,
  );

  if (!hasCompatibility) {
    return {
      version: release.version,
      hasCompatibility: false,
      reason: "version-mismatch",
    };
  }

  return {
    version: release.version,
    hasCompatibility: hasCompatibility,
  };
}
