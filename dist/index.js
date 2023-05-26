#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const helpers_1 = require("./helpers");
const generators_1 = require("./generators");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const program = new commander_1.Command();
        const defaultPrismaSchemaPath = "./prisma/schema.prisma";
        const defaultPrismaClientImportPath = "~/server/db";
        const defaultOutputDirectory = "nexquikApp";
        console.log(chalk_1.default.bgYellow.blue.bold(figlet_1.default.textSync("Nexquik", {
            font: "Univers",
            horizontalLayout: "default",
            verticalLayout: "default",
        })));
        program
            .version(require("../package.json").version)
            .description("An example CLI for managing a directory")
            .option("-schema <value>", "Path to prisma schema file", defaultPrismaSchemaPath)
            .option("-out <value>", "Path to output directory", defaultOutputDirectory)
            .option("-prismaImport <value>", "String to use for Prisma Import", defaultPrismaClientImportPath)
            .parse(process.argv);
        const options = program.opts();
        if (options.Schema && options.Out) {
            console.log(`${chalk_1.default.whiteBright.bold(`\nParams:`)}\n-----\nPrisma Schema location: ${chalk_1.default.yellow.bold(`${options.Schema}`)}\nOutput location: ${chalk_1.default.yellow.bold(`${options.Out}`)}\nPrisma Import: ${chalk_1.default.yellow.bold(`${options.PrismaImport}\n`)}-----\n`);
            yield (0, generators_1.generate)(options.Schema, options.Out);
            console.log(chalk_1.default.blue("Formatting Generated Files"));
            yield (0, helpers_1.formatNextJsFilesRecursively)(options.Out);
        }
    });
}
main().then(() => {
    console.log(chalk_1.default.green.bold("\nGenerated Successfully."));
});
//# sourceMappingURL=index.js.map