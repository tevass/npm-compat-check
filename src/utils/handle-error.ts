import { z } from "zod/v4";
import { logger } from "./logger";

export function handleError(error: unknown) {
  logger.break();

  logger.error(
    "Something went wrong. Please check the error below for more details.",
  );
  logger.error("If the problem persists, please open an issue on GitHub.");
  logger.error("");

  if (typeof error === "string") {
    logger.error(error);
    logger.break();
    process.exit(1);
  }

  if (error instanceof z.ZodError) {
    logger.error(z.prettifyError(error));
    logger.break();
    process.exit(1);
  }

  if (error instanceof Error) {
    logger.error(error.message);
    logger.break();
    process.exit(1);
  }

  logger.break();
  process.exit(1);
}
