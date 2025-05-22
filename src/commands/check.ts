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
  source: z.string().transform((val) => npm.parsePackageName(val)),
  target: z.string().transform((val) => npm.parsePackageName(val)),
});

export const checkCommand = new Command("compat-check")
  .description("Check compatibility between npm packages")
  .argument("<target>", "Target package with version (e.g. package@version)")
  .argument("<source>", "Source package to check")
  .action(async (targetPackage, sourcePackage) => {
    try {
      const options = optionsSchema.parse({
        target: targetPackage,
        source: sourcePackage,
      });

      const { target, source } = options;
      const isTargetSameAsSource = target.name === source.name;

      if (isTargetSameAsSource) {
        logger.error("Target package is the same as source package");

        return;
      }

      let targetVersion = npm.validVersion(target.rawSpec) ?? "0.0.0";
      const useLatestTargetVersion =
        target.type === "range" && target.rawSpec === "*";

      if (useLatestTargetVersion) {
        logger.warn(
          `Target package ${highlighter.info(target.name)} not has a version, using the latest stable version`,
        );
        logger.warn(
          `If you want to check a specific version, use the format: ${highlighter.info(`${target.name}@version`)}`,
        );

        const fetchReleasesOfTargetSpinner = spinner(
          `Fetching releases for ${highlighter.info(target.name)}`,
        ).start();

        targetVersion = await npm.getLatestStableVersion(target.name);

        fetchReleasesOfTargetSpinner.succeed(
          `Using ${highlighter.info(`${target.name}@${targetVersion}`)} as target package version`,
        );
      }

      const fetchReleasesOfSourceSpinner = spinner(
        `Fetching releases for ${highlighter.info(source.name)}`,
      ).start();

      const releasesOfSource = await npm.fetchStableVersions(source.name);

      fetchReleasesOfSourceSpinner.succeed(
        `Fetched ${highlighter.info(releasesOfSource.length)} stable releases for ${highlighter.info(source.name)}`,
      );

      for (const release of releasesOfSource) {
        const result = compatibility.checkCompatibility(
          { name: target.name, version: targetVersion },
          release,
        );

        const sourceWithVersion = `${source.name}@${release.version}`;
        const targetWithVersion = `${target.name}@${targetVersion}`;

        if (result.hasCompatibility) {
          logger.success(
            `✔ ${highlighter.info(sourceWithVersion)} is compatible with ${highlighter.info(targetWithVersion)}`,
          );

          break;
        }

        logger.error(
          `✖ ${highlighter.info(sourceWithVersion)} is not compatible with ${highlighter.info(targetWithVersion)} because "${result.reason}"`,
        );

        if (result.reason === "not-found") break;
      }
    } catch (error) {
      return handleError(error);
    }
  });
