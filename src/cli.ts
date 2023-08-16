import { GeneratorOptions } from "@prisma/generator-helper";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { generate } from "./generators";
import { formatDirectory } from "./helpers";
import ora from "ora"; // Import 'ora'

export interface CliArgs {
  prismaSchemaPath: string;
  outputDirectory: string;
}
export const defaultOutputDirectory = "nexquikApp";
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
        "-exclude <value>",
        "Comma-separated list of model names to exclude from the top-level of the generated app. (NOTE: If the -include is passed, this exclusion list will be ignored)",
        ""
      )
      .option(
        "-include <value>",
        "Comma-separated list of model names to include from the top-level of the generated app.",
        ""
      )
      .parse(process.argv);

    const cliArgs = program.opts();
    const prismaSchemaPath = options?.schemaPath || cliArgs.Schema;
    const outputDirectory = options?.generator?.output?.value || cliArgs.Output;
    const includedModels = cliArgs.include
      ? cliArgs.Include.split(",")
      : options?.generator.config.include
      ? String(options.generator.config.include).split(",")
      : [];
    const excludedModels =
      includedModels.length > 0
        ? []
        : cliArgs?.exclude
        ? cliArgs.exclude.split(",")
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
      includedModels
    );
    const spinner = ora(
      `${chalk.blue.bold("Linting and Formatting Generated Files...")}\n`
    ).start();
    await formatDirectory(outputDirectory);
    spinner.succeed(chalk.green.bold(`Linted and Formatted Generated Files`));

    console.log(
      `${chalk.green.bold(
        "✔ Success! Enjoy your new app at"
      )} ${outputDirectory}`
    );
  } catch (error) {
    console.log(chalk.red.bold("Nexquik Error:\n"), error);
  }
}
