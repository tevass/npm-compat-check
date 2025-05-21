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
    release.devDependencies[target.name];

  if (!releasePackageVersion) {
    return {
      version: release.version,
      isCompatible: false,
      reason: "not-found",
    };
  }

  const isCompatibleVersions = semver.satisfies(
    target.version,
    releasePackageVersion,
  );

  if (!isCompatibleVersions) {
    return {
      version: release.version,
      isCompatible: false,
      reason: "version-mismatch",
    };
  }

  return {
    version: release.version,
    isCompatible: isCompatibleVersions,
  };
}
