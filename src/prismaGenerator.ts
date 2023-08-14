import { generatorHandler } from "@prisma/generator-helper";
import { run } from "./cli";

generatorHandler({
  onManifest() {
    return {
      defaultOutput: "../generated",
      prettyName: "Nexquik",
    };
  },
  onGenerate: run,
});
