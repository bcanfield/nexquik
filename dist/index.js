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
const { Command } = require("commander");
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
function listDirContents(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs.promises.readdir(filepath);
            const detailedFilesPromises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                let fileDetails = yield fs.promises.lstat(path.resolve(filepath, file));
                const { size, birthtime } = fileDetails;
                return { filename: file, "size(KB)": size, created_at: birthtime };
            }));
            const detailedFiles = yield Promise.all(detailedFilesPromises);
            console.table(detailedFiles);
        }
        catch (error) {
            console.error("Error occurred while reading the directory!", error);
        }
    });
}
const program = new Command();
console.log(figlet.textSync("Prisnext"));
program
    .version("1.0.0")
    .description("An example CLI for managing a directory")
    .option("-l, --ls  [value]", "List directory contents")
    .option("-m, --mkdir <value>", "Create a directory")
    .option("-t, --touch <value>", "Create a file")
    .parse(process.argv);
const options = program.opts();
if (options.ls) {
    const filepath = typeof options.ls === "string" ? options.ls : __dirname;
    listDirContents(filepath);
}
//# sourceMappingURL=index.js.map