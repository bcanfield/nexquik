import { GeneratorOptions } from "@prisma/generator-helper";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { generate } from "./generators";

export interface CliArgs {
  prismaSchemaPath: string;
  outputDirectory: string;
}
export const defaultOutputDirectory = "nexquikApp";
export interface Group {
  name: string;
  include: string[];
  exclude: string[];
}
const defaultPrismaSchemaPath = "schema.prisma";

export async function run(options?: GeneratorOptions) {
  try {
    const disabled = process.env.DISABLE_NEXQUIK === "true";
    if (disabled) {
      return console.log("Nexquik generation disabled due to env var");
    }
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
      .option("-rootName <value>", "Name for the root app to be created");

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

    program.parse(process.argv);

    const cliArgs = program.opts();

    console.log({ groups, cliArgs });
    const prismaSchemaPath = options?.schemaPath || cliArgs.Schema;
    const outputDirectory = options?.generator?.output?.value || cliArgs.Output;
    const includedModels = cliArgs.Include
      ? cliArgs.Include.split(",")
      : options?.generator.config.include
      ? String(options.generator.config.include).split(",")
      : [];
    const maxDepth = parseInt(options?.generator.config.depth || cliArgs.Depth);
    const routeGroup =
      options?.generator.config.routeGroup || cliArgs.RouteGroup;
    const rootName = options?.generator.config.rootName || cliArgs.RootName;
    const init = options?.generator.config.init || cliArgs.Init || false;

    const routeGroupOnly =
      options?.generator.config.routeGroupOnly ||
      cliArgs.RouteGroupOnly ||
      false;
    const excludedModels =
      includedModels.length > 0
        ? []
        : cliArgs?.Exclude
        ? cliArgs.Exclude.split(",")
        : options?.generator.config.exclude
        ? String(options?.generator.config.exclude).split(",")
        : [];

    console.log(
      chalk.gray(
        `Fetching schema from ${prismaSchemaPath}\nOutputting to ${outputDirectory}\n`
      )
    );
    await generate(
      prismaSchemaPath,
      outputDirectory,
      maxDepth,
      init,
      rootName,
      groups
    );

    // await formatDirectory(outputDirectory);

    console.log(
      `${chalk.green.bold(
        "✔ Success! Enjoy your new app at"
      )} ${outputDirectory}`
    );
  } catch (error) {
    console.log(chalk.red.bold("Nexquik Error:\n"), error);
  }
}
