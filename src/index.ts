#!/usr/bin/env node

import { Command } from "commander";

import packageJson from "../package.json";

const program = new Command()
  .name("npm-compat")
  .description("check npm packages compatibility")
  .version(
    packageJson.version || "1.0.0",
    "-v, --version",
    "display the version number",
  );

program.parse();
