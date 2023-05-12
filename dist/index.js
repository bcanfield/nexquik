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
exports.generateNextComponents = void 0;
const prisma_ast_1 = require("@mrleebo/prisma-ast");
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const fs_1 = __importDefault(require("fs"));
const nunjucks_1 = require("nunjucks");
const path_1 = __importDefault(require("path"));
const generateNextComponents = (schemaFilePath, outputDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const outPath = "./test.json";
        const schema = fs_1.default.readFileSync(schemaFilePath, { encoding: "utf-8" });
        const jsonSchema = (0, prisma_ast_1.getSchema)(schema);
        const models = [];
        const enums = [];
        jsonSchema.list.forEach((section) => {
            if (section.type === "model") {
                models.push(section);
            }
            else if (section.type === "enum") {
                enums.push(section);
            }
        });
        fs_1.default.writeFileSync("./enums.json", JSON.stringify(enums));
        fs_1.default.writeFileSync("./models.json", JSON.stringify(models));
        if (!fs_1.default.existsSync(outputDirectory)) {
            fs_1.default.mkdirSync(outputDirectory);
        }
        // Main app dir page
        (0, nunjucks_1.render)(path_1.default.join(__dirname, "templates", "page", "page_base.njk"), {
            functionName: `Home`,
            pageName: `Home`,
        }, (err, output) => {
            if (output) {
                fs_1.default.writeFileSync(`${outputDirectory}/page.tsx`, output);
            }
        });
        for (const model of models) {
            // Main entity directory
            const componentDirectory = `${outputDirectory}/${model.name}`;
            if (!fs_1.default.existsSync(componentDirectory)) {
                fs_1.default.mkdirSync(componentDirectory);
            }
            //// List Page
            (0, nunjucks_1.render)(path_1.default.join(__dirname, "templates", "page", "page_base.njk"), { functionName: `${model.name}Home`, pageName: `${model.name} - List` }, (err, output) => {
                if (output) {
                    fs_1.default.writeFileSync(`${componentDirectory}/page.tsx`, output);
                }
            });
            //// Dynamic Directory
            const dynamicDirectory = `${componentDirectory}/[id]`;
            if (!fs_1.default.existsSync(dynamicDirectory)) {
                fs_1.default.mkdirSync(dynamicDirectory);
            }
            ////// Show Page
            (0, nunjucks_1.render)(path_1.default.join(__dirname, "templates", "page", "page_base.njk"), { functionName: `Show${model.name}`, pageName: `${model.name} - Show` }, (err, output) => {
                if (output) {
                    fs_1.default.writeFileSync(`${dynamicDirectory}/page.tsx`, output);
                }
            });
            ////// Edit Directory
            const editDirectory = `${dynamicDirectory}/edit`;
            if (!fs_1.default.existsSync(editDirectory)) {
                fs_1.default.mkdirSync(editDirectory);
            }
            //////// Edit Page
            (0, nunjucks_1.render)(path_1.default.join(__dirname, "templates", "page", "page_base.njk"), { functionName: `Edit${model.name}`, pageName: `${model.name} - Edit` }, (err, output) => {
                if (output) {
                    fs_1.default.writeFileSync(`${editDirectory}/page.tsx`, output);
                }
            });
            //// Create Directory
            const createDirectory = `${componentDirectory}/create`;
            if (!fs_1.default.existsSync(createDirectory)) {
                fs_1.default.mkdirSync(createDirectory);
            }
            ////// Create Page
            (0, nunjucks_1.render)(path_1.default.join(__dirname, "templates", "page", "page_base.njk"), {
                functionName: `Create${model.name}`,
                pageName: `${model.name} - Create`,
            }, (err, output) => {
                if (output) {
                    fs_1.default.writeFileSync(`${createDirectory}/page.tsx`, output);
                }
            });
        }
        console.log("Success.");
    }
    catch (error) {
        console.log("Failed.");
        console.log(error);
    }
});
exports.generateNextComponents = generateNextComponents;
const program = new commander_1.Command();
const defaultPrismaSchemaPath = "./prisma/schema.prisma";
const defaultOutputDirectory = "./prisnextApp";
console.log(figlet_1.default.textSync("Nexquik"));
program
    .version(require("../package.json").version)
    .description("An example CLI for managing a directory")
    .option("-schema <value>", "Path to prisma schema file", defaultPrismaSchemaPath)
    .option("-out <value>", "Path to output directory", defaultOutputDirectory)
    .parse(process.argv);
const options = program.opts();
if (options.Schema && options.Out) {
    console.log(`${chalk_1.default.green.bold(`Looking for Prisma Schema at: ${options.Schema}`)}\n${chalk_1.default.cyanBright.bold(`Outputting generated files to: ${options.Out}`)}`);
    (0, exports.generateNextComponents)(options.Schema, options.Out);
}
//# sourceMappingURL=index.js.map