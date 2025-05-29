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
  maxReleases: z.coerce.number().int().positive(),
});

export const checkCommand = new Command("compat-check")
  .description("Check compatibility between npm packages")
  .argument(
    "<target>",
    "Package name to check compatibility against the base package. (e.g. package@version)",
  )
  .argument(
    "<base>",
    "Package name to analyze for compatibility with the target package. (e.g. package@version)",
  )
  .option(
    "-m, --max-releases <amount>",
    "Amount of releases to check before exit",
    "5",
  )
  .action(async (targetPackage, basePackage, opts) => {
    try {
      const options = optionsSchema.parse({
        base: basePackage,
        target: targetPackage,
        ...opts,
      });

      const { base, target } = options;
      const isSamePackages = target.name === base.name;

      if (isSamePackages) {
        logger.error(
          "Packages must have different names, use the format: package@version",
        );
        process.exit(1);
      }

      const baseVersion = await resolvePackageVersion(base);
      const targetVersion = await resolvePackageVersion(target);

      const fetchReleasesOfSourceSpinner = spinner(
        `Fetching releases for ${highlighter.info(base.name)}`,
      ).start();

      const releasesOfBasePackage = await npm.fetchStableReleases(base.name);

      fetchReleasesOfSourceSpinner.succeed(
        `Fetched ${highlighter.info(releasesOfBasePackage.length)} releases for ${highlighter.info(base.name)}`,
      );
      logger.break();

      let amountOfReleasesChecked = 0;
      for (const release of releasesOfBasePackage) {
        const checkCompatibilitySpinner = spinner();

        const result = compatibility.checkCompatibility(
          { name: target.name, version: targetVersion.version },
          release,
        );

        if (result.hasCompatibility) {
          checkCompatibilitySpinner.succeed(
            highlighter.success(
              `${highlighter.info(`${baseVersion.name}@${release.version}`)} is compatible with ${highlighter.info(targetVersion.raw)}`,
            ),
          );

          process.exit(0);
        }

        amountOfReleasesChecked++;
        checkCompatibilitySpinner.fail(
          highlighter.error(
            `${highlighter.info(`${baseVersion.name}@${release.version}`)} is not compatible with ${highlighter.info(targetVersion.raw)} because "${result.reason}"`,
          ),
        );

        const hasExceededMaxReleases =
          amountOfReleasesChecked >= opts.maxReleases;
        if (result.reason === "not-found" || hasExceededMaxReleases) break;
      }

      logger.break();
      logger.error(
        `No compatible release of ${highlighter.info(baseVersion.raw)} was found for ${highlighter.info(targetVersion.raw)}. Checked ${highlighter.info(amountOfReleasesChecked)} releases.`,
      );
    } catch (error) {
      return handleError(error);
    }
  });
