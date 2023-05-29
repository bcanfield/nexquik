import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import { formatDirectory } from "./helpers";
import { generate } from "./generators";

export async function run() {
  try {
    const program = new Command();
    const defaultPrismaSchemaPath = "./prisma/schema.prisma";
    const defaultPrismaClientImportPath = "~/server/db";
    const defaultOutputDirectory = "nexquikApp";

    console.log(
      chalk.bgYellow.blue.bold(
        figlet.textSync("Nexquik", {
          font: "Univers",
          horizontalLayout: "default",
          verticalLayout: "default",
        })
      )
    );
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
      .option(
        "-prismaImport <value>",
        "String to use for Prisma Import",
        defaultPrismaClientImportPath
      )
      .parse(process.argv);

    const options = program.opts();
    if (options.Schema && options.Out) {
      console.log(
        `${chalk.whiteBright.bold(
          `\nParams:`
        )}\n-----\nPrisma Schema location: ${chalk.yellow.bold(
          `${options.Schema}`
        )}\nOutput location: ${chalk.yellow.bold(
          `${options.Out}`
        )}\nPrisma Import: ${chalk.yellow.bold(
          `${options.PrismaImport}\n`
        )}-----\n`
      );
      await generate(options.Schema, options.Out);
      console.log(chalk.blue("Formatting Generated Files"));
      await formatDirectory(options.Out);
      console.log(chalk.green.bold("\nGenerated Successfully."));
    }
  } catch (error) {
    console.log(chalk.red.bold("Nexquik Error:\n"), error);
  }
}
