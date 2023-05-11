#! /usr/bin/env node
import { Enum, getSchema, Model } from "@mrleebo/prisma-ast";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import fs from "fs";
import { render } from "nunjucks";
import path from "path";

import { Block } from "@mrleebo/prisma-ast";

export type PrismaSchemaSectionType = {
  name: string;
  value: Block;
};

export const generateNextComponents = async (
  schemaFilePath: string,
  outputDirectory: string
) => {
  try {
    const outPath = "./test.json";
    const schema = fs.readFileSync(schemaFilePath, { encoding: "utf-8" });
    const jsonSchema = getSchema(schema);
    const models: Model[] = [];
    const enums: Enum[] = [];
    jsonSchema.list.forEach((section) => {
      if (section.type === "model") {
        models.push(section);
      } else if (section.type === "enum") {
        enums.push(section);
      }
    });

    fs.writeFileSync("./enums.json", JSON.stringify(enums));
    fs.writeFileSync("./models.json", JSON.stringify(models));

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory);
    }
    // For model in models
    // Create a nextjs app directory tree node in outDir
    // In that file create crud
    for (const model of models) {
      const componentDirectory = `${outputDirectory}/${model.name}`;
      if (!fs.existsSync(componentDirectory)) {
        fs.mkdirSync(componentDirectory);
      }
      // fs.writeFileSync(
      //   `${componentDirectory}/page.tsx`,
      //   JSON.stringify(`Testing for: ${model.name}`)
      // );
      // Read one of our templates
      render(
        path.join(__dirname, "templates", "page", "page_base.njk"),
        { functionName: `${model.name}Home`, pageName: `${model.name} - List` },
        (err, output) => {
          console.log({ err, output });
          if (output) {
            fs.writeFileSync(`${componentDirectory}/page.tsx`, output);
          }
        }
      );
    }

    console.log("Success.");
  } catch (error) {
    console.log("Failed.");
    console.log(error);
  }
};

const program = new Command();
const defaultPrismaSchemaPath = "./prisma/schema.prisma";
const defaultOutputDirectory = "./prisnextApp";

console.log(figlet.textSync("Prisnext"));

program
  .version(require("../package.json").version)
  .description("An example CLI for managing a directory")
  .option(
    "-schema <value>",
    "Path to prisma schema file",
    defaultPrismaSchemaPath
  )
  .option("-out <value>", "Path to output directory", defaultOutputDirectory)
  .parse(process.argv);

const options = program.opts();
if (options.Schema && options.Out) {
  console.log(
    `${chalk.green.bold(
      `Looking for Prisma Schema at: ${options.Schema}`
    )}\n${chalk.cyanBright.bold(
      `Outputting generated files to: ${options.Out}`
    )}`
  );
  generateNextComponents(options.Schema, options.Out);
}
