import * as child_process from "child_process";
import { readdirSync } from "fs";
import path from "path";
import { isDirectoryNotEmpty } from "../utils";

const nexquikMain = "./dist/index.js";
const prismaSchemaDirectory = path.join(
  "__tests__",
  "prisma-schemas",
  "minimal-examples"
);
const prismaMain = "./node_modules/prisma/build/index.js";

// Create an array of schema paths
const schemaPaths = readdirSync(prismaSchemaDirectory);

// Define a function to run a single schema test asynchronously
async function runSchemaTest(schemaPath) {
  const testOutputDirectory = path.join(
    "__tests__",
    "prisma-schemas",
    `${schemaPath}-test-output`
  );
  try {
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
    child_process.execSync(
      `node ${nexquikMain} group --name MainGroup --init --rootName gen --schema ${path.join(
        prismaSchemaDirectory,
        schemaPath
      )} --output ${testOutputDirectory}`
    );

    console.log(`Schema Test: ${schemaPath}`);
    expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();

    // Run npm install
    child_process.execSync("npm install --quiet", {
      cwd: testOutputDirectory,
    });
    // Run next build
    child_process.execSync(`npm run build`, {
      stdio: "inherit",
      cwd: testOutputDirectory,
    });
    // Run prisma generate
    child_process.execSync(`node ${prismaMain} generate`, {
      stdio: "inherit",
      cwd: testOutputDirectory,
    });
    // Run type check
    child_process.execSync("npm run typecheck", {
      stdio: "inherit",
      cwd: testOutputDirectory,
    });
  } catch (error) {
    console.error("TypeScript compilation error:", error.message);
    throw error;
  } finally {
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
  }
}

// Run schema tests
schemaPaths.forEach((schemaPath) => {
  test(`Schema Test: ${schemaPath}`, async () => {
    await runSchemaTest(schemaPath);
  });
});
