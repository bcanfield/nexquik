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
        "-schema <value>",
        "Path to prisma schema file",
        defaultPrismaSchemaPath
      )
      .option(
        "-deps",
        "Auto npm install dependencies in your output directory.",
        false
      )
      .option(
        "-output <value>",
        "Path to output directory",
        defaultOutputDirectory
      )
      .option(
        "-depth <value>",
        "Maximum recursion depth for your models. (Changing this for large data models is not recommended, unless you filter down your models with the 'include' or 'exclude' flags also.)",
        "5"
      )
      .option(
        "-routeGroupOnly",
        "Outputs the built app as a route group, and excludes config files found in next.js root directory"
      )
      .option("-init", "Initializes a full next.js app")
      .option(
        "-extendOnly",
        "Only creates the models specified in the current command, and leaves previously created ones alone."
      )
      .option("-rootName <value>", "Name for the root app to be created", "gen")
      .option("-disabled <value>", "Disable the generator", false);

    program
      .command("generate")
      // .description("Manage groups with include and exclude options")
      .option("--group <name>", "Specify a group name", (name) => {
        // Create a new group object for each group
        currentGroup = { name, include: [], exclude: [] };
        groups.push(currentGroup);
      })
      .option(
        "--include <types>",
        "Specify included types (comma-separated)",
        (types) => {
          // Add the included types to the current group
          if (currentGroup) {
            currentGroup.include = types.split(",");
          }
        }
      )
      .option(
        "--exclude <types>",
        "Specify excluded types (comma-separated)",
        (types) => {
          // Add the excluded types to the current group
          if (currentGroup) {
            currentGroup.exclude = types.split(",");
          }
        }
      );

    if (options?.generator.config) {
      try {
        const genArgs = options?.generator.config.command.split(" ") || [];
        program.parse(genArgs, { from: "user" });
      } catch {
        throw Error("Invalid args");
      }
    } else {
      program.parse(process.argv);
    }

    const cliArgs = program.opts();

    const deps = cliArgs.Deps || false;

    const prismaSchemaPath = options?.schemaPath || cliArgs.Schema;
    const outputDirectory = cliArgs.Output;
    const maxDepth = parseInt(cliArgs.Depth);
    const rootName = cliArgs.RootName;
    const init = cliArgs.Init || false;
    const extendOnly = cliArgs.ExtendOnly || false;
    const disabled =
      process.env.DISABLE_NEXQUIK === "true" || cliArgs.Disabled === true;
    if (disabled) {
      return console.log("Nexquik generation disabled due to env var");
    }

    await generate(
      prismaSchemaPath,
      outputDirectory,
      maxDepth,
      init,
      rootName,
      groups,
      extendOnly,
      deps
    );

    console.log(`${chalk.blue.bold("\nLinting Generated Files...")}`);
    const startTime = new Date().getTime();

    const eslint = new ESLint({
      fix: true,
      useEslintrc: false,
      overrideConfig: {
        extends: [
          // "next/core-web-vitals",
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
