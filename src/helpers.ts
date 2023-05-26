import path from "path";
import fs from "fs";
import prettier from "prettier";
import { RouteObject } from "./generators";

export function copyDirectory(
  sourceDir: string,
  destinationDir: string,
  toReplace: boolean = false
): void {
  if (toReplace && fs.existsSync(destinationDir)) {
    fs.rmSync(destinationDir, { recursive: true });
  }

  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir);
  }

  // Read the contents of the source directory
  const files = fs.readdirSync(sourceDir);

  files.forEach((file) => {
    const sourceFile = path.join(sourceDir, file);
    const destinationFile = path.join(destinationDir, file);

    // Check if the file is a directory
    if (fs.statSync(sourceFile).isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourceFile, destinationFile, toReplace);
    } else {
      // Copy file if it doesn't exist in the destination directory
      if (!fs.existsSync(destinationFile)) {
        fs.copyFileSync(sourceFile, destinationFile);
      }
    }
  });
}

export const formatNextJsFilesRecursively = async (directory: string) => {
  try {
    // Get a list of all files and directories in the current directory
    const entries = await fs.promises.readdir(directory);

    for (const entry of entries) {
      const entryPath = path.join(directory, entry);

      // Check if the entry is a file
      const isFile = (await fs.promises.stat(entryPath)).isFile();

      if (isFile) {
        // Filter the file to include only Next.js files (e.g., .js, .jsx, .ts, .tsx)
        if (/\.(jsx?|tsx?)$/.test(path.extname(entry))) {
          const fileContents = await fs.promises.readFile(entryPath, "utf8");

          // Format the file contents using Prettier
          const formattedContents = prettier.format(fileContents, {
            parser: "babel-ts", // Specify the parser according to your project's configuration
          });

          // Write the formatted contents back to the file
          await fs.promises.writeFile(entryPath, formattedContents);
        }
      } else {
        // If the entry is a directory, recursively call the function for that directory
        await formatNextJsFilesRecursively(entryPath);
      }
    }
  } catch (error) {
    console.error("An error occurred while formatting files:", error);
  }
};

export function findAndReplaceInFiles(
  directoryPath: string,
  searchString: string,
  replacementString: string
): void {
  // Read the directory contents
  const files = fs.readdirSync(directoryPath);

  // Iterate through all files and directories
  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    // Check if the path is a directory
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively search and replace in subdirectories
      findAndReplaceInFiles(filePath, searchString, replacementString);
    } else {
      // Read the file content
      let fileContent = fs.readFileSync(filePath, "utf-8");

      // Perform case-insensitive find and replace
      const pattern = new RegExp(searchString, "gi");
      fileContent = fileContent.replace(pattern, (match) => {
        // Preserve the casing of the first character
        const firstChar = match.charAt(0);
        const replacementFirstChar = replacementString.charAt(0);
        const replacedFirstChar =
          firstChar === firstChar.toLowerCase()
            ? replacementFirstChar.toLowerCase()
            : firstChar === firstChar.toUpperCase()
            ? replacementFirstChar.toUpperCase()
            : replacementFirstChar;
        return replacedFirstChar + replacementString.slice(1);
      });

      // Write the modified content back to the file
      fs.writeFileSync(filePath, fileContent, "utf-8");
    }
  }
}

export function copyFileToDirectory(
  sourcePath: string,
  destinationDirectory: string
): void {
  const fileName = path.basename(sourcePath);
  const destinationPath = path.join(destinationDirectory, fileName);

  const readStream = fs.createReadStream(sourcePath);
  const writeStream = fs.createWriteStream(destinationPath);

  readStream.on("error", (error) => {
    console.error(`Error reading file: ${error}`);
  });

  writeStream.on("error", (error) => {
    console.error(`Error writing file: ${error}`);
  });

  readStream.pipe(writeStream);
}

export function popStringEnd(str: string, char: string): string {
  const lastIndex = str.lastIndexOf(char);

  if (lastIndex === -1) {
    // Character not found in the string
    return str;
  }
  return str.substring(0, lastIndex);
}

export function prettyPrintAPIRoutes(routes: RouteObject[]) {
  console.log("API Routes:");
  console.log("-----------");
  for (const route of routes) {
    console.log(
      `${route.segment} - ${route.operation} ${route.model}: ${route.description}`
    );
  }
}
export const getDynamicSlug = (
  modelName: string | undefined,
  uniqueIdFieldName: string | undefined
) => {
  if (modelName && uniqueIdFieldName) {
    return `${modelName}${uniqueIdFieldName}`;
  } else {
    return "";
  }
};

export function convertRouteToRedirectUrl(input: string): string {
  const regex = /\[(.*?)\]/g;
  const replaced = input.replace(regex, (_, innerValue) => {
    return `\${params.${innerValue}}`;
  });

  return `${replaced}`;
}
