import * as child_process from "child_process";
import { isDirectoryNotEmpty } from "../utils";

const testOutputDirectory =
  "__tests__/core-functionality-tests/testOutputDirectory";

const prismaMain = "./node_modules/prisma/build/index.js";

test("prisma-generator", async () => {
  child_process.execSync(`rm -rf ${testOutputDirectory}`);
  child_process.execSync(
    `prisma generate --schema __tests__/core-functionality-tests/schema.prisma`,
    {
      stdio: "inherit",
    }
  );
  expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();
  try {
    // Run npm install
    child_process.execSync("npm install --quiet", {
      cwd: testOutputDirectory,
    });
  } catch (error) {
    console.error("TypeScript compilation error:", error.message);
    throw error;
  } finally {
    child_process.execSync(`rm -rf ${testOutputDirectory}`);
  }
});
