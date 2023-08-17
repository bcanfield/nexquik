import * as child_process from "child_process";
import { readdirSync, statSync } from "fs";
import path from "path";
import { isDirectoryNotEmpty } from "../utils";

const nexquikMain = "./dist/index.js";
const testOutputDirectory = path.join(
  "__tests__",
  "core",
  "modelsOnlyTestOutputDirectory"
);
const prismaSchemaDirectory = "prisma";
const prismaMain = "./node_modules/prisma/build/index.js";

test.each(readdirSync(prismaSchemaDirectory))(
  `Schema Test: %p`,
  (schemaPath: string) => {
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
    let res = child_process.execSync(
      `node ${nexquikMain} -schema ${path.join(
        prismaSchemaDirectory,
        schemaPath
      )} -output ${testOutputDirectory} -modelsOnly`
    );
    console.log(`Schema Test: ${schemaPath}`);
    expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
  }
);
