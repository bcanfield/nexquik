#! /usr/bin/env node
import { Command } from "commander";
import figlet from "figlet";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import {
  getSchema,
  printSchema,
  Schema,
  Enum,
  Model,
} from "@mrleebo/prisma-ast";

import { Block } from "@mrleebo/prisma-ast";

export type PrismaSchemaSectionType = {
  name: string;
  value: Block;
};

export const sortPrismaSchema = async (path: string) => {
  try {
    const outPath = "./test.json";
    const schema = fs.readFileSync(path, { encoding: "utf-8" });
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

    console.log("Success.");
  } catch (error) {
    console.log("Failed.");
    console.log(error);
  }
};

const program = new Command();
const defaultPrismaSchemaPath = "./prisma/schema.prisma";
console.log(figlet.textSync("Prisnext"));
program
  .version(require("../package.json").version)
  .description("An example CLI for managing a directory")
  .option("-schema <value>", "Path to prisma schema", defaultPrismaSchemaPath)
  .parse(process.argv);

const options = program.opts();
console.log({ options });
if (options.Schema) {
  console.log(
    chalk.green.bold(`Looking for Prisma Schema at: ${options.Schema}`)
  );
  sortPrismaSchema(options.Schema);
}
