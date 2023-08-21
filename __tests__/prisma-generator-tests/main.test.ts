import * as child_process from "child_process";
import { isDirectoryNotEmpty } from "../utils";
const testOutputDirectory =
  "__tests__/prisma-generator-tests/testOutputDirectory";
test("base.prisma", async () => {
  child_process.execSync(`rm -rf ${testOutputDirectory}`);
  child_process.execSync(
    `prisma generate --schema __tests__/prisma-generator-tests/schema.prisma`,
    {
      stdio: "inherit",
    }
  );
  expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();
  child_process.execSync(`rm -rf ${testOutputDirectory}`);
});
