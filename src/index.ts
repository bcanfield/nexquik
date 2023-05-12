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

    // Main app dir page
    render(
      path.join(__dirname, "templates", "page", "page_base.njk"),
      {
        functionName: `Home`,
        pageName: `Home`,
      },
      (err, output) => {
        if (output) {
          fs.writeFileSync(`${outputDirectory}/page.tsx`, output);
        }
      }
    );

    for (const model of models) {
      // Main entity directory
      const componentDirectory = `${outputDirectory}/${model.name}`;
      if (!fs.existsSync(componentDirectory)) {
        fs.mkdirSync(componentDirectory);
      }

      //// List Page
      render(
        path.join(__dirname, "templates", "page", "page_base.njk"),
        { functionName: `${model.name}Home`, pageName: `${model.name} - List` },
        (err, output) => {
          if (output) {
            fs.writeFileSync(`${componentDirectory}/page.tsx`, output);
          }
        }
      );

      //// Dynamic Directory
      const dynamicDirectory = `${componentDirectory}/[id]`;
      if (!fs.existsSync(dynamicDirectory)) {
        fs.mkdirSync(dynamicDirectory);
      }

      ////// Show Page
      render(
        path.join(__dirname, "templates", "page", "page_base.njk"),
        { functionName: `Show${model.name}`, pageName: `${model.name} - Show` },
        (err, output) => {
          if (output) {
            fs.writeFileSync(`${dynamicDirectory}/page.tsx`, output);
          }
        }
      );

      ////// Edit Directory
      const editDirectory = `${dynamicDirectory}/edit`;
      if (!fs.existsSync(editDirectory)) {
        fs.mkdirSync(editDirectory);
      }

      //////// Edit Page
      render(
        path.join(__dirname, "templates", "page", "page_base.njk"),
        { functionName: `Edit${model.name}`, pageName: `${model.name} - Edit` },
        (err, output) => {
          if (output) {
            fs.writeFileSync(`${editDirectory}/page.tsx`, output);
          }
        }
      );

      //// Create Directory
      const createDirectory = `${componentDirectory}/create`;
      if (!fs.existsSync(createDirectory)) {
        fs.mkdirSync(createDirectory);
      }

      ////// Create Page
      render(
        path.join(__dirname, "templates", "page", "page_base.njk"),
        {
          functionName: `Create${model.name}`,
          pageName: `${model.name} - Create`,
        },
        (err, output) => {
          if (output) {
            fs.writeFileSync(`${createDirectory}/page.tsx`, output);
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
