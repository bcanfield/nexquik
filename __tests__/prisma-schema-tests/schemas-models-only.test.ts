import * as child_process from "child_process";
import { readdirSync } from "fs";
import path from "path";
import { isDirectoryNotEmpty } from "../utils";

const nexquikMain = "./dist/index.js";
const testOutputDirectory = path.join(
  "__tests__",
  "prisma-schema-tests",
  "modelsOnlyTestOutputDirectory"
);
const prismaSchemaDirectory = path.join(
  "__tests__",
  "prisma-schemas",
  "minimal-examples"
);
test.each(readdirSync(prismaSchemaDirectory))(
  `Schema Test: %p`,
  (schemaPath: string) => {
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
    child_process.execSync(
      `node ${nexquikMain} -schema ${path.join(
        prismaSchemaDirectory,
        schemaPath
      )} -output ${testOutputDirectory} -routeGroupOnly`
    );
    console.log(`Schema Test: ${schemaPath}`);
    expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
  }
);
