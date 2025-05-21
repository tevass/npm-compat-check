#!/usr/bin/env node

import { checkCommand } from "./commands/check";

import packageJson from "../package.json";

const program = checkCommand.version(
  packageJson.version || "1.0.0",
  "-v, --version",
  "display the version number",
);

program.parse();
