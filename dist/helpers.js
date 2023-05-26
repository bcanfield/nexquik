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
exports.convertRouteToRedirectUrl = exports.getDynamicSlug = exports.prettyPrintAPIRoutes = exports.popStringEnd = exports.copyFileToDirectory = exports.findAndReplaceInFiles = exports.formatNextJsFilesRecursively = exports.copyDirectory = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prettier_1 = __importDefault(require("prettier"));
function copyDirectory(sourceDir, destinationDir, toReplace = false) {
    if (toReplace && fs_1.default.existsSync(destinationDir)) {
        fs_1.default.rmSync(destinationDir, { recursive: true });
    }
    // Create destination directory if it doesn't exist
    if (!fs_1.default.existsSync(destinationDir)) {
        fs_1.default.mkdirSync(destinationDir);
    }
    // Read the contents of the source directory
    const files = fs_1.default.readdirSync(sourceDir);
    files.forEach((file) => {
        const sourceFile = path_1.default.join(sourceDir, file);
        const destinationFile = path_1.default.join(destinationDir, file);
        // Check if the file is a directory
        if (fs_1.default.statSync(sourceFile).isDirectory()) {
            // Recursively copy subdirectories
            copyDirectory(sourceFile, destinationFile, toReplace);
        }
        else {
            // Copy file if it doesn't exist in the destination directory
            if (!fs_1.default.existsSync(destinationFile)) {
                fs_1.default.copyFileSync(sourceFile, destinationFile);
            }
        }
    });
}
exports.copyDirectory = copyDirectory;
const formatNextJsFilesRecursively = (directory) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get a list of all files and directories in the current directory
        const entries = yield fs_1.default.promises.readdir(directory);
        for (const entry of entries) {
            const entryPath = path_1.default.join(directory, entry);
            // Check if the entry is a file
            const isFile = (yield fs_1.default.promises.stat(entryPath)).isFile();
            if (isFile) {
                // Filter the file to include only Next.js files (e.g., .js, .jsx, .ts, .tsx)
                if (/\.(jsx?|tsx?)$/.test(path_1.default.extname(entry))) {
                    const fileContents = yield fs_1.default.promises.readFile(entryPath, "utf8");
                    // Format the file contents using Prettier
                    const formattedContents = prettier_1.default.format(fileContents, {
                        parser: "babel-ts", // Specify the parser according to your project's configuration
                    });
                    // Write the formatted contents back to the file
                    yield fs_1.default.promises.writeFile(entryPath, formattedContents);
                }
            }
            else {
                // If the entry is a directory, recursively call the function for that directory
                yield (0, exports.formatNextJsFilesRecursively)(entryPath);
            }
        }
    }
    catch (error) {
        console.error("An error occurred while formatting files:", error);
    }
});
exports.formatNextJsFilesRecursively = formatNextJsFilesRecursively;
function findAndReplaceInFiles(directoryPath, searchString, replacementString) {
    // Read the directory contents
    const files = fs_1.default.readdirSync(directoryPath);
    // Iterate through all files and directories
    for (const file of files) {
        const filePath = path_1.default.join(directoryPath, file);
        // Check if the path is a directory
        if (fs_1.default.statSync(filePath).isDirectory()) {
            // Recursively search and replace in subdirectories
            findAndReplaceInFiles(filePath, searchString, replacementString);
        }
        else {
            // Read the file content
            let fileContent = fs_1.default.readFileSync(filePath, "utf-8");
            // Perform case-insensitive find and replace
            const pattern = new RegExp(searchString, "gi");
            fileContent = fileContent.replace(pattern, (match) => {
                // Preserve the casing of the first character
                const firstChar = match.charAt(0);
                const replacementFirstChar = replacementString.charAt(0);
                const replacedFirstChar = firstChar === firstChar.toLowerCase()
                    ? replacementFirstChar.toLowerCase()
                    : firstChar === firstChar.toUpperCase()
                        ? replacementFirstChar.toUpperCase()
                        : replacementFirstChar;
                return replacedFirstChar + replacementString.slice(1);
            });
            // Write the modified content back to the file
            fs_1.default.writeFileSync(filePath, fileContent, "utf-8");
        }
    }
}
exports.findAndReplaceInFiles = findAndReplaceInFiles;
function copyFileToDirectory(sourcePath, destinationDirectory) {
    const fileName = path_1.default.basename(sourcePath);
    const destinationPath = path_1.default.join(destinationDirectory, fileName);
    const readStream = fs_1.default.createReadStream(sourcePath);
    const writeStream = fs_1.default.createWriteStream(destinationPath);
    readStream.on("error", (error) => {
        console.error(`Error reading file: ${error}`);
    });
    writeStream.on("error", (error) => {
        console.error(`Error writing file: ${error}`);
    });
    readStream.pipe(writeStream);
}
exports.copyFileToDirectory = copyFileToDirectory;
function popStringEnd(str, char) {
    const lastIndex = str.lastIndexOf(char);
    if (lastIndex === -1) {
        // Character not found in the string
        return str;
    }
    return str.substring(0, lastIndex);
}
exports.popStringEnd = popStringEnd;
function prettyPrintAPIRoutes(routes) {
    console.log("API Routes:");
    console.log("-----------");
    for (const route of routes) {
        console.log(`${route.segment} - ${route.operation} ${route.model}: ${route.description}`);
    }
}
exports.prettyPrintAPIRoutes = prettyPrintAPIRoutes;
const getDynamicSlug = (modelName, uniqueIdFieldName) => {
    if (modelName && uniqueIdFieldName) {
        return `${modelName}${uniqueIdFieldName}`;
    }
    else {
        return "";
    }
};
exports.getDynamicSlug = getDynamicSlug;
function convertRouteToRedirectUrl(input) {
    const regex = /\[(.*?)\]/g;
    const replaced = input.replace(regex, (_, innerValue) => {
        return `\${params.${innerValue}}`;
    });
    return `${replaced}`;
}
exports.convertRouteToRedirectUrl = convertRouteToRedirectUrl;
//# sourceMappingURL=helpers.js.map