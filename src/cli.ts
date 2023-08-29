import { GeneratorOptions } from "@prisma/generator-helper";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { generate } from "./generators";
import { formatDirectory, installPackages } from "./helpers";
import path from "path";
import { spawnSync } from "child_process";
import { ESLint } from "eslint";
// require("eslint-plugin-unused-imports");
export interface CliArgs {
  prismaSchemaPath: string;
  outputDirectory: string;
}
export const defaultOutputDirectory = "./";
export interface Group {
  name: string;
  include: string[];
  exclude: string[];
}
const defaultPrismaSchemaPath = "schema.prisma";

export async function run(options?: GeneratorOptions) {
  try {
    console.log(
      chalk.bgYellow.blue.bold(
        figlet.textSync("Nexquik", {
          font: "Univers",
          horizontalLayout: "default",
          verticalLayout: "default",
        })
      )
    );
    const program = new Command();

    // Create an array to collect group objects
    const groups: Group[] = [];
    let currentGroup:
      | { name: string; include: string[]; exclude: string[] }
      | undefined = undefined;
    program
      .version(require("../package.json").version)
      .description("Auto-generate a Next.js 13 app from your DB Schema")
      .option(
        "--schema <schemaLocation>",
        "Path to prisma schema file",
        defaultPrismaSchemaPath
      )
      .option(
        "--appTitle <title>",
        "Title to be used in the header of your app",
        "App"
      )
      .option(
        "--deps",
        "Auto npm install dependencies in your output directory.",
        false
      )
      .option(
        "--output <outputDir>",
        "Path to output directory",
        defaultOutputDirectory
      )
      .option(
        "--depth <depthValue>",
        "Maximum recursion depth for your models. (Changing this for large data models is not recommended, unless you filter down your models with the 'include' or 'exclude' flags also.)",
        "5"
      )
      .option("--init", "Initializes a full Next.js app from scratch")
      .option(
        "--extendOnly",
        "Only creates the models specified in the current command, and leaves previously created ones alone."
      )
      .option(
        "--rootName <dirName>",
        "Desired name for the root app dir for your generated groups (this is the first directory nested under your 'app' directory.",
        "gen"
      )
      .option(
        "--prismaImport <prismaImportString>",
        "Import location for your prisma client if it differs from the standard setup.",
        'import prisma from "@/lib/prisma";'
      )
      .option("--disabled", "Disable the generator", false);

    program
      .command("group")
      .description(
        "Create a group to organize your models into route groups. You may create One-to-many of these."
      )
      .option("--name <groupName>", "Specify a group name", (groupName) => {
        // Create a new group object for each group
        currentGroup = { name: groupName, include: [], exclude: [] };
        groups.push(currentGroup);
      })
      .option(
        "--include <modelNames>",
        "Specify included types (comma-separated)",
        (modelNames) => {
          // Add the included types to the current group
          if (currentGroup) {
            currentGroup.include = modelNames.split(",");
          }
        }
      )
      .option(
        "--exclude <modelNames>",
        "Specify excluded types (comma-separated)",
        (modelNames) => {
          // Add the excluded types to the current group
          if (currentGroup) {
            currentGroup.exclude = modelNames.split(",");
          }
        }
      );

    // If prisma generator, parse the cli args from the generator config
    if (options?.generator.config) {
      try {
        const genArgs = options?.generator.config.command.split(" ") || [];
        program.parse(genArgs, { from: "user" });
      } catch {
        throw Error("Invalid args");
      }
    } else {
      // Else, parse from cli args
      program.parse(process.argv);
    }

    const cliArgs = program.opts();

    const deps = cliArgs.deps || false;
    const prismaSchemaPath = options?.schemaPath || cliArgs.schema;
    const outputDirectory = cliArgs.output;
    const maxDepth = parseInt(cliArgs.Depth);
    const rootName = cliArgs.rootName;
    const prismaImportString = cliArgs.prismaImport;
    const init = cliArgs.init || false;
    const extendOnly = cliArgs.extendOnly || false;
    const disabled =
      process.env.DISABLE_NEXQUIK === "true" || cliArgs.disabled === true;
    const appTitle = cliArgs.appTitle;
    if (disabled) {
      return console.log("Nexquik generation disabled due to env var");
    }

    console.log({ cliArgs });
    await generate(
      prismaSchemaPath,
      outputDirectory,
      maxDepth,
      init,
      rootName,
      groups,
      extendOnly,
      deps,
      prismaImportString,
      appTitle
    );

    console.log(`${chalk.blue.bold("\nLinting Generated Files...")}`);
    const startTime = new Date().getTime();

    const eslint = new ESLint({
      fix: true,
      useEslintrc: false,
      overrideConfig: {
        extends: [
          "plugin:@typescript-eslint/eslint-recommended",
          "plugin:@typescript-eslint/recommended",
        ],
        plugins: [
          "@typescript-eslint",
          "unused-imports",
          "react",
          "react-hooks",
        ],
        rules: {
          "no-unused-vars": "off",
          "@typescript-eslint/no-unused-vars": "error",
          "unused-imports/no-unused-imports": "error",
          "import/no-unused-modules": ["error"],
        },
      },
    });
    const results = await eslint.lintFiles([
      `${outputDirectory}/app/${rootName}/**/*.tsx`,
    ]);

    await ESLint.outputFixes(results);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    console.log(chalk.gray(`(Linted in ${duration} seconds)`));
    console.log(`${chalk.green.bold("\n✔ Success!")}`);
    return;
  } catch (error) {
    console.log(chalk.red.bold("Nexquik Error:\n"), error);
  }
}
