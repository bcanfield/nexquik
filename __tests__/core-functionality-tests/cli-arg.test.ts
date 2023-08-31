import * as child_process from "child_process";
import path from "path";
import { isDirectoryNotEmpty } from "../utils";
const prismaMain = "./node_modules/prisma/build/index.js";

const nexquikMain = "./dist/index.js";
const schemaPath = path.join(
  "__tests__",
  "prisma-schemas",
  "minimal-examples",
  "one-to-many.prisma"
);
const testOutputDirectory = path.join(
  "__tests__",
  "core-functionality-tests",
  `testOutputDirectory`
);

// Create an array of schema paths
const commands: {
  command: string;
  removePreviousDirectory: boolean;
  name: string;
}[] = [
  // Init
  {
    command: `node ${nexquikMain} group --name MainGroup --init --rootName gen --schema ${schemaPath} --output ${testOutputDirectory}`,
    removePreviousDirectory: true,
    name: "Init",
  },
  // Deps
  {
    command: `node ${nexquikMain} deps --output ${testOutputDirectory}`,
    removePreviousDirectory: false,
    name: "Deps",
  },
  // Extend Only
  {
    command: `node ${nexquikMain} group --name MainGroup --extendOnly --rootName gen --schema ${schemaPath} --output ${testOutputDirectory}`,
    removePreviousDirectory: false,
    name: "Extend Only",
  },
  // Prisma Import
  {
    command: `node ${nexquikMain} group --name MainGroup --rootName gen --schema ${schemaPath} --output ${testOutputDirectory} --prismaImport 'import prisma from "@/lib/prisma";'`,
    removePreviousDirectory: false,
    name: "Prisma Import",
  },
  // Depth
  {
    command: `node ${nexquikMain} group --name MainGroup --extendOnly --rootName gen --schema ${schemaPath} --output ${testOutputDirectory} --depth 1`,
    removePreviousDirectory: false,
    name: "Depth",
  },
  // Disabled
  {
    command: `node ${nexquikMain} group --name MainGroup --extendOnly --rootName gen --schema ${schemaPath} --output ${testOutputDirectory} --disabled`,
    removePreviousDirectory: false,
    name: "Disabled",
  },
];

// Define a function to run a single schema test asynchronously
async function runSchemaTest({ command, removePreviousDirectory }) {
  try {
    if (removePreviousDirectory) {
      child_process.execSync(`rm -rf ${testOutputDirectory}`);
    }
    child_process.execSync(command);
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
    console.error("Command Test error:", error.message);
    throw error;
  }
}

// Run schema tests
commands.forEach((command) => {
  test(`Schema Test: ${command}`, async () => {
    await runSchemaTest(command);
  });
});
