import { Command } from "commander";
import { z } from "zod/v4";

import {
  compatibility,
  handleError,
  highlighter,
  logger,
  npm,
  resolvePackageVersion,
  spinner,
} from "../utils";

const optionsSchema = z.object({
  base: z.string().transform((val) => npm.parsePackageName(val)),
  target: z.string().transform((val) => npm.parsePackageName(val)),
});

export const checkCommand = new Command("compat-check")
  .description("Check compatibility between npm packages")
  .argument(
    "<base>",
    "Package name to analyze for compatibility with the target package. (e.g. package@version)",
  )
  .argument(
    "<target>",
    "Package name to check compatibility against the base package. (e.g. package@version)",
  )
  .action(async (basePackage, targetPackage) => {
    try {
      const options = optionsSchema.parse({
        base: basePackage,
        target: targetPackage,
      });

      const { base, target } = options;
      const isSamePackages = target.name === base.name;

      if (isSamePackages) {
        logger.error(
          "Packages must have different names, use the format: package@version",
        );
        process.exit(1);
      }

      const baseVersion = await resolvePackageVersion(options.base);
      const targetVersion = await resolvePackageVersion(options.target);

      const fetchReleasesOfSourceSpinner = spinner(
        `Fetching releases for ${highlighter.info(base.name)}`,
      ).start();

      const releasesOfSource = await npm.fetchStableReleases(base.name);

      fetchReleasesOfSourceSpinner.succeed(
        `Fetched ${highlighter.info(releasesOfSource.length)} stable releases for ${highlighter.info(base.name)}`,
      );

      for (const release of releasesOfSource) {
        const result = compatibility.checkCompatibility(
          { name: target.name, version: targetVersion },
          release,
        );

        const sourceWithVersion = `${base.name}@${baseVersion}`;
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
