import * as child_process from "child_process";
import { readdirSync } from "fs";
import path from "path";

const nexquikMain = "dist/index.js";
const testOutputDirectory = path.join("__tests__", "testOutputDirectory");

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

const testSchema = (prismaSchemaLocation: string) => {
  child_process.execSync(`rm -rf ${testOutputDirectory}`);

  child_process.execSync(
    `node ${nexquikMain} -schema ${prismaSchemaLocation} -out ${testOutputDirectory}`
  );
};

test("simple-1-n", async () => {
  testSchema("./prisma/simple-1-n.prisma");
  expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy;
  child_process.execSync(`rm -rf ${testOutputDirectory}`);
});

test("schema", async () => {
  testSchema("./prisma/schema.prisma");
  expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy;
  child_process.execSync(`rm -rf ${testOutputDirectory}`);
});
