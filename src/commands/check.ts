import { Command } from "commander";
import { z } from "zod";

import {
  compatibility,
  handleError,
  highlighter,
  logger,
  npm,
  spinner,
} from "../utils";

const optionsSchema = z.object({
  sourcePackage: z.string().transform((val) => npm.parsePackageName(val)),
  targetPackage: z.string().transform((val) => npm.parsePackageName(val)),
});

export const checkCommand = new Command("compat-check")
  .description("Check compatibility between npm packages")
  .argument("<target>", "Target package with version (e.g. package@version)")
  .argument("<source>", "Source package to check")
  .action(async (targetPackage, sourcePackage) => {
    try {
      const options = optionsSchema.parse({ sourcePackage, targetPackage });

      let versionOfTarget =
        npm.validVersion(options.targetPackage.rawSpec) ?? "0.0.0";

      const useLatestTargetVersion =
        options.targetPackage.type === "range" &&
        options.targetPackage.rawSpec === "*";

      if (useLatestTargetVersion) {
        logger.warn(
          `Target package ${highlighter.info(options.targetPackage.name)} not has a version, using the latest stable version`,
        );
        logger.warn(
          `If you want to check a specific version, use the format: ${highlighter.info(`${options.targetPackage.name}@version`)}`,
        );

        const fetchReleasesOfTargetSpinner = spinner(
          `Fetching releases for ${highlighter.info(options.targetPackage.name)}`,
        ).start();

        const latestVersion = await npm.getLastestStableVersion(
          options.targetPackage.name,
        );

        versionOfTarget = latestVersion;

        fetchReleasesOfTargetSpinner.succeed(
          `Using ${highlighter.info(`${options.targetPackage.name}@${versionOfTarget}`)} as target package version`,
        );
      }

      const fetchReleasesOfSourceSpinner = spinner(
        `Fetching releases for ${highlighter.info(options.sourcePackage.name)}`,
      ).start();

      const releasesOfSource = await npm.fetchStableVersions(
        options.sourcePackage.name,
      );

      fetchReleasesOfSourceSpinner.succeed(
        `Fetched ${highlighter.info(releasesOfSource.length)} stable releases for ${highlighter.info(options.sourcePackage.name)}`,
      );

      for (const release of releasesOfSource) {
        const result = compatibility.checkCompatibility(
          { name: options.targetPackage.name, version: versionOfTarget },
          release,
        );

        const sourceWithVersion = `${options.sourcePackage.name}@${release.version}`;
        const targetWithVersion = `${options.targetPackage.name}@${versionOfTarget}`;

        if (result.isCompatible) {
          logger.success(
            `✔ ${highlighter.info(sourceWithVersion)} is compatible with ${highlighter.info(targetWithVersion)}`,
          );

          break;
        }

        logger.error(
          `✖ ${highlighter.info(sourceWithVersion)} is not compatible with ${highlighter.info(targetWithVersion)} because "${result.reason}"`,
        );
      }
    } catch (error) {
      return handleError(error);
    }
  });
