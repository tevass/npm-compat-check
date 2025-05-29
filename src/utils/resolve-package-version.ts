import semver from "semver";

import type { PackageName, RawPackageName } from "../types";
import { highlighter, logger, npm, spinner } from "../utils";

async function resolvePackageVersionFromRange(packageName: RawPackageName) {
  const isPackageHasVersion = npm.hasValidVersion(packageName.rawSpec);
  if (!isPackageHasVersion) {
    logger.warn(
      `Package ${highlighter.info(packageName.name)} not has a version, using the latest stable version`,
    );
    logger.warn(
      `If you want to check a specific version, use the format: ${highlighter.info(`${packageName.name}@version`)}`,
    );

    const fetchReleasesOfTargetSpinner = spinner(
      `Fetching releases for ${highlighter.info(packageName.name)}`,
    ).start();

    const currentPackage = await npm.getLatestStableVersion(packageName);

    fetchReleasesOfTargetSpinner.succeed(
      `Using ${highlighter.info(currentPackage.raw)}`,
    );

    return currentPackage;
  }

  const checkingPackageVersionExistsSpinner = spinner(
    `Checking if ${highlighter.info(packageName.raw)} exists`,
  ).start();

  const targetPackageVerion = await npm.getPackageVersion(packageName);
  if (targetPackageVerion) {
    checkingPackageVersionExistsSpinner.succeed(
      `Using ${highlighter.info(targetPackageVerion.raw)}`,
    );

    return targetPackageVerion;
  }

  checkingPackageVersionExistsSpinner.text = `Package ${highlighter.info(packageName.raw)} not found, fetching the latest stable version`;

  const stableVersions = await npm.fetchStableVersions(packageName);
  const latestStableVersion = stableVersions.find((version) =>
    semver.satisfies(version, packageName.rawSpec),
  );

  if (!latestStableVersion) {
    throw new Error(
      `No version found for ${highlighter.info(packageName.name)}`,
    );
  }

  const currentPackage: PackageName = {
    name: packageName.name,
    version: latestStableVersion,
    raw: `${packageName.name}@${latestStableVersion}`,
  };

  checkingPackageVersionExistsSpinner.succeed(
    `Using ${highlighter.info(currentPackage.raw)}`,
  );

  return currentPackage;
}

async function resolvePackageVersionFromTag(packageName: RawPackageName) {
  const checkingPackageTagExistsSpinner = spinner(
    `Checking if ${highlighter.info(packageName.raw)} exists`,
  ).start();

  const targetPackageVersion = await npm.getPackageVersion(packageName);
  if (!targetPackageVersion) {
    throw new Error(
      `No version found for ${highlighter.info(packageName.raw)}`,
    );
  }

  checkingPackageTagExistsSpinner.succeed(
    `Using ${highlighter.info(targetPackageVersion.raw)}`,
  );

  return targetPackageVersion;
}

function defaultResolvePackageVersion(
  packageName: RawPackageName,
): PackageName {
  const version = npm.parseVersion(packageName.rawSpec);

  return {
    version,
    name: packageName.name,
    raw: `${packageName.name}@${version}`,
  };
}

export async function resolvePackageVersion(
  packageName: RawPackageName,
): Promise<PackageName> {
  switch (packageName.type) {
    case "range":
      return resolvePackageVersionFromRange(packageName);

    case "tag":
      return resolvePackageVersionFromTag(packageName);

    default:
      return defaultResolvePackageVersion(packageName);
  }
}
