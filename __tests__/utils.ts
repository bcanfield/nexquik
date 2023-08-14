// expect(isDirectoryNotEmpty(testOutputDirectory)).toBeTruthy();
import * as child_process from "child_process";
import { readdirSync } from "fs";

// export const validateOutputDirectory ()
export const isDirectoryNotEmpty = (path: string) => {
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

export function validateOutputDirectory(
  outputDirectory: string,
  runGenerate?: boolean
) {
  try {
    // Run npm install
    child_process.execSync("npm install --quiet", {
      cwd: outputDirectory,
    });
    // // Run prisma generate
    if (runGenerate) {
      child_process.execSync(`npm run generate`, {
        stdio: "inherit",
        cwd: outputDirectory,
      });
    }
    // Run type check
    child_process.execSync("npm run typecheck", {
      stdio: "inherit",
      cwd: outputDirectory,
    });
  } catch (error) {
    console.error("TypeScript compilation error:", error.message);
    throw error;
  } finally {
    child_process.execSync(`rm -rf ${outputDirectory}`);
  }
}
