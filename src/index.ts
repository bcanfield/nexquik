#! /usr/bin/env node
import { Enum, Field, getSchema, Model, Property } from "@mrleebo/prisma-ast";
import chalk from "chalk";
import { Command } from "commander";
import figlet from "figlet";
import fs from "fs";
import { render } from "nunjucks";
import path from "path";
import { format } from "prettier";

import { Block } from "@mrleebo/prisma-ast";
import { prismaToHtmlMap } from "./types";

export type PrismaSchemaSectionType = {
  name: string;
  value: Block;
};

export const generateNextComponents = async (
  schemaFilePath: string,
  outputDirectory: string,
  prismaImport: string
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
      const lowerCaseModelName = model.name.toLowerCase();
      // Main entity directory
      const componentDirectory = `${outputDirectory}/${lowerCaseModelName}`;
      if (!fs.existsSync(componentDirectory)) {
        fs.mkdirSync(componentDirectory);
      }

      //// List Page
      render(
        path.join(__dirname, "templates", "page", "page_base.njk"),
        {
          functionName: `${model.name}Home`,
          pageName: `${lowerCaseModelName} - List`,
        },
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
        {
          functionName: `Show${model.name}`,
          pageName: `${lowerCaseModelName} - Show`,
        },
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
        {
          functionName: `Edit${model.name}`,
          pageName: `${lowerCaseModelName} - Edit`,
        },
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
      interface FormElement {
        fieldName: string;
        inputType: string;
        required: boolean;
        options?: string[];
      }

      const formElements: FormElement[] = [];
      for (const {
        fieldType,
        name,
        attributes,
        type,
        comment,
        optional,
        array,
      } of model.properties as Field[]) {
        // If exists in our map, use that
        // Else, check other elements
        // console.log({ property });
        const htmlInputType = prismaToHtmlMap[fieldType as string];
        if (htmlInputType) {
          // console.log("Field Type Found", { fieldType });
          formElements.push({
            fieldName: name,
            inputType: htmlInputType,
            required: !optional,
          });
        } else {
          console.log("Field Type Not Found", { fieldType });
        }
      }
      console.log({ formElements });
      render(
        path.join(__dirname, "templates", "page", "page_create.njk"),
        {
          functionName: `Create${model.name}`,
          pageName: `${model.name} - Create`,
          entityName: `${model.name}`,
          formElements: formElements,
          prismaImport: prismaImport,
        },
        (err, output) => {
          console.log({ err });
          if (output) {
            fs.writeFileSync(
              `${createDirectory}/page.tsx`,
              format(output, { parser: "babel-ts" })
            );
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
const defaultPrismaClientImportPath = "~/server/db";
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
  generateNextComponents(options.Schema, options.Out, options.PrismaImport);
}
