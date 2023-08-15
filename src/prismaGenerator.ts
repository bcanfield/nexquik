#!/usr/bin/env node
import { generatorHandler } from "@prisma/generator-helper";
import { run } from "./cli";

console.log("in generator handler");
generatorHandler({
  onManifest() {
    return {
      defaultOutput: "../generated",
      prettyName: "Nexquik",
    };
  },
  onGenerate: run,
});
