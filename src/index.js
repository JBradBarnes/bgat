#!/usr/bin/env node
// import cli from "./cli";

const yargs = require("yargs");

const argv = yargs.command({
  command: "greet",
  describe: "Greet the user",
  handler: () => {
    console.log("Hello from the CLI!");
  },
});

console.log("ARGS", JSON.stringify(argv));
