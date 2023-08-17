import path from "path";
import fs from "fs";
import prettier from "prettier";
import { RouteObject } from "./generators";
import { ESLint } from "eslint";
import chalk from "chalk";
// import ora from "ora";

export function copyAndRenameFile(
  sourceFilePath: string,
  destinationDirectory: string,
  newFileName: string
) {
  const destinationFilePath = path.join(destinationDirectory, newFileName);

  try {
    // Check if the destination file exists
    if (fs.existsSync(destinationFilePath)) {
      // Delete the existing file
      fs.unlinkSync(destinationFilePath);
    }

    // Copy the source file to the destination
    fs.copyFileSync(sourceFilePath, destinationFilePath);
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

export async function listFilesInDirectory(
  directoryPath: string
): Promise<string[]> {
  const files: string[] = [];

  async function traverseDirectory(currentPath: string): Promise<void> {
    const entries = await fs.promises.readdir(currentPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isFile()) {
        files.push(fullPath);
      } else if (entry.isDirectory()) {
        await traverseDirectory(fullPath);
      }
    }
  }

  await traverseDirectory(directoryPath);
  return files;
}

export const copyDirectoryContents = async (
  sourceDirectory: string,
  destinationDirectory: string
) => {
  if (!fs.existsSync(sourceDirectory)) {
    throw new Error(`Source directory "${sourceDirectory}" does not exist.`);
  }

  // Create the destination directory if it doesn't exist
  if (!fs.existsSync(destinationDirectory)) {
    fs.mkdirSync(destinationDirectory, { recursive: true });
  }

  const files = await fs.promises.readdir(sourceDirectory);

  for (const file of files) {
    const sourcePath = path.join(sourceDirectory, file);
    const destinationPath = path.join(destinationDirectory, file);

    const stat = await fs.promises.stat(sourcePath);

    if (stat.isDirectory()) {
      // If it's a sub-directory, recursively copy its contents
      await copyDirectoryContents(sourcePath, destinationPath);
    } else {
      // If it's a file, copy it to the destination
      await fs.promises.copyFile(sourcePath, destinationPath);
    }
  }
};
const waitForEvent = (emitter: any, event: any) =>
  new Promise((resolve) => emitter.once(event, resolve));

export async function copyPublicDirectory(
  sourceDir: string,
  destinationDir: string,
  toReplace = false,
  skipChildDir?: string
) {
  // console.log(
  //   chalk.yellowBright(`Copying directory: ${sourceDir} to ${destinationDir}`)
  // );

  try {
    if (toReplace && fs.existsSync(destinationDir)) {
      fs.rmSync(destinationDir, { recursive: true });
    }

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir);
    }

    const files = fs.readdirSync(sourceDir, { withFileTypes: true });
    // for (let index = 0; index < array.length; index++) {
    //   const element = array[index];

    // }

    for (let index = 0; index < files.length; index++) {
      const entry = files[index];

      const file = entry.name;

      if (file === skipChildDir) {
        return;
      }

      const sourceFile = path.join(sourceDir, file);
      const destinationFile = path.join(destinationDir, file);

      if (entry.isDirectory()) {
        copyDirectory(sourceFile, destinationFile, toReplace, skipChildDir);
      } else {
        if (!fs.existsSync(destinationFile)) {
          // fse.copyFileSync(sourceFile, destinationFile);
          const srcStream = fs.createReadStream(sourceFile);
          await waitForEvent(srcStream, "ready");
          const destStream = fs.createWriteStream(destinationFile);
          await waitForEvent(destStream, "ready");
          const handleError = (err: any) => {
            throw new Error(err);
          };
          srcStream.on("error", handleError);
          destStream.on("error", handleError);

          srcStream.pipe(destStream);
          await waitForEvent(srcStream, "end");
        }
      }
    }
  } catch (error) {
    console.error(chalk.red("An error occurred:", error));
  }
}

export async function copyImage(
  sourceDir: string,
  sourceFile: string,
  destinationDir: string
) {
  try {
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir);
    }
    const destinationFile = path.join(destinationDir, sourceFile);

    if (!fs.existsSync(destinationFile)) {
      // fse.copyFileSync(sourceFile, destinationFile);
      const srcStream = fs.createReadStream(path.join(sourceDir, sourceFile));
      await waitForEvent(srcStream, "ready");
      const destStream = fs.createWriteStream(destinationFile);
      await waitForEvent(destStream, "ready");
      const handleError = (err: any) => {
        throw new Error(err);
      };
      srcStream.on("error", handleError);
      destStream.on("error", handleError);

      srcStream.pipe(destStream);
      await waitForEvent(srcStream, "end");
    }
  } catch (error) {
    console.error(chalk.red("An error occurred:", error));
  }
}

function addStringsBetweenComments(
  fileContent: string,
  insertData: Array<{
    insertString: string;
    startComment: string;
    endComment: string;
  }>
): string {
  insertData.forEach(({ insertString, startComment, endComment }) => {
    while (
      fileContent.includes(startComment) &&
      fileContent.includes(endComment)
    ) {
      const startIndex = fileContent.indexOf(startComment);
      const endIndex = fileContent.indexOf(endComment) + endComment.length;
      const contentToRemove = fileContent.slice(startIndex, endIndex);
      fileContent = fileContent.replace(contentToRemove, insertString);
    }
  });

  return fileContent;
}

export async function modifyFile(
  sourceFilePath: string,
  destinationFilePath: string,
  insertData: Array<{
    insertString: string;
    startComment: string;
    endComment: string;
  }>,
  modelName?: string
) {
  try {
    const fileContent = fs.readFileSync(sourceFilePath, "utf8");

    // Perform string replacements
    let modifiedContent = addStringsBetweenComments(fileContent, insertData);
    modifiedContent = await prettier.format(modifiedContent, {
      parser: "babel-ts", // Specify the parser according to your project's configuration
    });
    if (modelName) {
      modifiedContent = findAndReplaceInFile(
        modifiedContent,
        "nexquikTemplateModel",
        modelName
      );
    }
    // Write the modified content to the destination file
    fs.promises.writeFile(destinationFilePath, modifiedContent);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// copy files from one directory to another
// copy files from one directory to another
export function copyDirectory(
  sourceDir: string,
  destinationDir: string,
  toReplace = false,
  skipChildDir?: string
): void {
  // console.log(
  //   chalk.yellowBright(`Copying directory: ${sourceDir} to ${destinationDir}`)
  // );

  try {
    if (toReplace && fs.existsSync(destinationDir)) {
      fs.rmSync(destinationDir, { recursive: true });
    }

    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir);
    }

    const files = fs.readdirSync(sourceDir, { withFileTypes: true });
    files.forEach((entry) => {
      const file = entry.name;

      if (file === skipChildDir) {
        return;
      }

      const sourceFile = path.join(sourceDir, file);
      const destinationFile = path.join(destinationDir, file);

      if (entry.isDirectory()) {
        copyDirectory(sourceFile, destinationFile, toReplace, skipChildDir);
      } else {
        if (!fs.existsSync(destinationFile)) {
          fs.copyFileSync(sourceFile, destinationFile);
        }
      }
    });
  } catch (error) {
    console.error(chalk.red("An error occurred:", error));
  }
}

export const formatNextJsFilesRecursively = async (directory: string) => {
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
        const formattedContents = await prettier.format(fileContents, {
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
};
export const deleteDirectoryRecursively = async (directoryPath: string) => {
  if (!fs.existsSync(directoryPath)) {
    throw new Error(`Directory "${directoryPath}" does not exist.`);
  }

  const files = await fs.promises.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      // If it's a sub-directory, recursively delete it
      await deleteDirectoryRecursively(filePath);
    } else {
      // If it's a file, delete it
      await fs.promises.unlink(filePath);
    }
  }

  // Delete the empty directory
  await fs.promises.rmdir(directoryPath);
};
async function getFilePaths(directoryPath: string): Promise<string[]> {
  const files: string[] = [];

  const processDirectory = async (dirPath: string) => {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        await processDirectory(fullPath); // Recursively process subdirectories
      } else if (entry.isFile()) {
        files.push(fullPath); // Add file path to the array
      }
    }
  };

  await processDirectory(directoryPath);

  return files;
}

export async function formatDirectory(directoryPath: string): Promise<void> {
  const files = (await getFilePaths(directoryPath)).filter((filePath: string) =>
    filePath.endsWith(".tsx")
  );
  // console.log(`${chalk.blue.bold(`Linting ${files.length} files...`)}`);

  // const results = await eslint.lintFiles(files);

  // Format the files using Prettier
  console.log(`${chalk.blue.bold(`Formatting ${files.length} files...`)}`);
  const prettierConfig = await prettier.resolveConfig(directoryPath);
  await Promise.all(
    files.map(async (result) => {
      const filePath = result;
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      const formattedContent = await prettier.format(fileContent, {
        ...prettierConfig,
        filepath: filePath,
      });
      await fs.promises.writeFile(filePath, formattedContent, "utf-8");
    })
  );
}

export function findAndReplaceInFile(
  textContent: string,
  searchString: string,
  replacementString: string
): string {
  const pattern = new RegExp(searchString, "gi");
  return textContent.replace(pattern, (match) => {
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
}

export function copyFileToDirectory(
  sourceFilePath: string,
  targetDirectoryPath: string
): void {
  const fileName = path.basename(sourceFilePath);
  const targetFilePath = path.join(targetDirectoryPath, fileName);

  fs.copyFileSync(sourceFilePath, targetFilePath);
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
export const getDynamicSlugs = (
  modelName: string | undefined,
  uniqueIdFieldNames: string[]
): string[] => {
  const slugs: string[] = [];
  uniqueIdFieldNames.forEach((idField) => {
    slugs.push(`${modelName}${idField}`);
  });
  return slugs;
};

export function convertRouteToRedirectUrl(input: string): string {
  const regex = /\[(.*?)\]/g;
  const replaced = input.replace(regex, (_, innerValue) => {
    return `\${params.${innerValue}}`;
  });

  return `${replaced}`;
}
export function convertRoutesToRedirectUrl(input: string): string {
  const regex = /\[(.*?)\]/g;
  const replaced = input.replace(regex, (_, innerValue) => {
    return `\${params.${innerValue}}`;
  });

  return `${replaced}`;
}
