import semver from "semver";

import type { PackageName } from "../types";
import { highlighter, logger, npm, spinner } from "../utils";

async function resolvePackageVersionFromRange(packageName: PackageName) {
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

    const targetVersion = await npm.getLatestStableVersion(packageName.name);

    fetchReleasesOfTargetSpinner.succeed(
      `Using ${highlighter.info(`${packageName.name}@${targetVersion}`)}`,
    );

    return targetVersion;
  }

  const checkingPackageVersionExistsSpinner = spinner(
    `Checking if ${highlighter.info(packageName.raw)} exists`,
  ).start();

  const packageVersion = await npm.getPackageVersion(packageName);
  if (packageVersion) {
    checkingPackageVersionExistsSpinner.succeed(
      `Using ${highlighter.info(`${packageName.name}@${packageVersion}`)}`,
    );

    return npm.parseVersion(packageVersion);
  }

  checkingPackageVersionExistsSpinner.text = `Package ${highlighter.info(packageName.raw)} not found, fetching the latest stable version`;

  const stableVersions = await npm.fetchStableVersions(packageName.name);

  const latestStableVersion = stableVersions.find((version) =>
    semver.satisfies(version, packageName.rawSpec),
  );

  if (!latestStableVersion) {
    throw new Error(
      `No version found for ${highlighter.info(packageName.raw)}`,
    );
  }

  checkingPackageVersionExistsSpinner.succeed(
    `Using ${highlighter.info(`${packageName.name}@${latestStableVersion}`)}`,
  );

  return npm.parseVersion(latestStableVersion);
}

async function resolvePackageVersionFromTag(packageName: PackageName) {
  const checkingPackageTagExistsSpinner = spinner(
    `Checking if ${highlighter.info(packageName.raw)} exists`,
  ).start();

  const packageVersion = await npm.getPackageVersion(packageName);

  if (!packageVersion) {
    throw new Error(
      `No version found for ${highlighter.info(packageName.raw)}`,
    );
  }

  checkingPackageTagExistsSpinner.succeed(
    `Using ${highlighter.info(`${packageName.name}@${packageVersion}`)}`,
  );

  return npm.parseVersion(packageVersion);
}

export async function resolvePackageVersion(packageName: PackageName) {
  switch (packageName.type) {
    case "version":
      return npm.parseVersion(packageName.rawSpec);

    case "range":
      return resolvePackageVersionFromRange(packageName);

    case "tag":
      return resolvePackageVersionFromTag(packageName);

    default:
      return npm.parseVersion(packageName.rawSpec);
  }
}
