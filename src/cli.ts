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
      .option("-routeGroup <value>", "Name for the route group", "")
      .option(
        "-exclude <value>",
        "Comma-separated list of model names to exclude from the top-level of the generated app. (NOTE: If the -include is passed, this exclusion list will be ignored)",
        ""
      )
      .option(
        "-include <value>",
        "Comma-separated list of model names to include from the top-level of the generated app.",
        ""
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
      .parse(process.argv);

    const cliArgs = program.opts();
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
      excludedModels,
      includedModels,
      maxDepth,
      routeGroupOnly,
      routeGroup
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
