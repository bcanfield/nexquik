import { GeneratorOptions } from "@prisma/generator-helper";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { generate } from "./generators";
import { formatDirectory } from "./helpers";

export interface CliArgs {
  prismaSchemaPath: string;
  outputDirectory: string;
}
const defaultOutputDirectory = "nexquikApp";
const defaultPrismaSchemaPath = "./prisma/schema.prisma";

export async function run(options?: GeneratorOptions) {
  try {
    const args = process.argv;
    console.log({ args });
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
      .description("An example CLI for managing a directory")
      .option(
        "-schema <value>",
        "Path to prisma schema file",
        defaultPrismaSchemaPath
      )
      .option(
        "-out <value>",
        "Path to output directory",
        defaultOutputDirectory
      )
      .parse(process.argv);

    const cliArgs = program.opts();
    const prismaSchemaPath = options?.schemaPath || cliArgs.Schema;
    const outputDirectory =
      options?.generator.config.outputDirectory || cliArgs.Out;
    console.log(
      `${chalk.whiteBright.bold(
        `\nParams:`
      )}\n-----\nPrisma Schema location: ${chalk.yellow.bold(
        `${prismaSchemaPath}`
      )}\nOutput location: ${chalk.yellow.bold(`${outputDirectory}`)}\n`
    );

    await generate(prismaSchemaPath, outputDirectory);
    console.log(chalk.blue("Formatting Generated Files"));
    await formatDirectory(outputDirectory);
    console.log(chalk.green.bold("\nGenerated Successfully."));
  } catch (error) {
    console.log(chalk.red.bold("Nexquik Error:\n"), error);
  }
}
