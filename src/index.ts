#! /usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { formatNextJsFilesRecursively } from "./fileHelpers";
import { generateReactForms } from "./generators";

async function main() {
  const program = new Command();
  const defaultPrismaSchemaPath = "./prisma/schema.prisma";
  const defaultPrismaClientImportPath = "~/server/db";
  const defaultOutputDirectory = "nexquikApp";

  console.log(figlet.textSync("Nexquik"));

  program
    .version(require("../package.json").version)
    .description("An example CLI for managing a directory")
    .option(
      "-schema <value>",
      "Path to prisma schema file",
      defaultPrismaSchemaPath
    )
    .option("-out <value>", "Path to output directory", defaultOutputDirectory)
    .option(
      "-prismaImport <value>",
      "String to use for Prisma Import",
      defaultPrismaClientImportPath
    )
    .parse(process.argv);

  const options = program.opts();
  if (options.Schema && options.Out) {
    console.log(
      `${chalk.green.bold(
        `Looking for Prisma Schema at: ${options.Schema}`
      )}\n${chalk.cyanBright.bold(
        `Outputting generated files to: ${options.Out}`
      )}\n${chalk.blue.bold(`Prisma Import Value: ${options.PrismaImport}`)}`
    );
    await generateReactForms(options.Schema, options.Out);
    await formatNextJsFilesRecursively(options.Out);
  }
}

main().then(() => {
  console.log("Done.");
});
