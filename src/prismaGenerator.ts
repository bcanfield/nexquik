#!/usr/bin/env node
import { generatorHandler } from "@prisma/generator-helper";
import { defaultOutputDirectory, run } from "./cli";
import chalk from "chalk";

console.log(chalk.gray("Running Nexquik as Prisma Generator"));
generatorHandler({
  onManifest() {
    return {
      prettyName: "Nexquik",
      version: require("../package.json").version,
      defaultOutput: defaultOutputDirectory,
    };
  },
  onGenerate: run,
});
