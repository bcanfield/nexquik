import * as child_process from "child_process";
import { readdirSync, statSync } from "fs";
import path from "path";

const nexquikMain = "dist/index.js";
const testOutputDirectory = path.join("__tests__", "testOutputDirectory");
const prismaSchemaDirectory = "prisma";
const prismaMain = "node_modules/prisma/build/index.js";

function buildDirectoryStructure(
  directoryPath: string,
  indentation: string = ""
): string {
  let result = "";

  const files = readdirSync(directoryPath);

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      const subDirectoryPath = path.join(directoryPath, file);
      const subDirectoryResult = buildDirectoryStructure(
        subDirectoryPath,
        `${indentation}  `
      );
      result += `${indentation}${file}/\n${subDirectoryResult}`;
    }
  });

  return result;
}

const isDirectoryNotEmpty = (path: string) => {
  try {
    const files = readdirSync(path);
    return files.length > 0;
  } catch (err) {
    if (err.code === "ENOENT") {
      // Directory doesn't exist
      return false;
    } else {
      // Other error occurred
      throw err;
    }
  }
};

test.each(readdirSync(prismaSchemaDirectory))(
  `Schema Test: %p`,
  (schemaPath: string) => {
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
    let res = child_process.execSync(
      `node ${nexquikMain} -schema ${path.join(
        prismaSchemaDirectory,
        schemaPath
      )} -out ${testOutputDirectory}`
    );
    console.log(`Schema Test: ${schemaPath}`);
    // prettyPrintDirectory(testOutputDirectory);
    expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();
    // res = child_process.execSync(
    //   `cd ${testOutputDirectory} && npm i && npx tsc`
    // );
    // child_process.execSync(`rm -rf ${testOutputDirectory}`);
    try {
      // console.log("In here:", res);
      // res = child_process.execSync(
      //   `cd ${testOutputDirectory} && npm i && npx tsc`
      // );
      // res = child_process.execSync(
      //   `cd ${testOutputDirectory} && npm i && npx tsc`
      // );
      child_process.execSync("npm install --quiet", {
        cwd: testOutputDirectory,
      }); // Run npm install
      child_process.execSync(`node ${prismaMain} generate`, {
        stdio: "inherit",
        cwd: testOutputDirectory,
      }); // Run prisma generate
      child_process.execSync("npm run typecheck", {
        stdio: "inherit",
        cwd: testOutputDirectory,
      }); // Run type check
    } catch (error) {
      console.error("TypeScript compilation error:", error.message);
      // Handle the error as needed
      throw error; // Rethrow the error to fail the test
    } finally {
      // child_process.execSync(`rm -rf ${testOutputDirectory}`);
    }
  }
);
