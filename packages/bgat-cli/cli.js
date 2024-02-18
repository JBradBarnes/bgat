const fs = require("fs");
const path = require("path");
const yargs = require("yargs");
const { ParserContext } = require("bgat-parser/paserContext");
const { VariableContext, VariableType } = require("common/core/Variable/types");

const argv = yargs
  .option("entry", {
    describe: "List of files to process",
    type: "array",
    demandOption: true, // Make it required
    array: true,
    alias: "e",
  })
  .option("parameter", {
    describe: "Dictionary of key-value pairs",
    type: "array",
    alias: "p",
    coerce: (param) => {
      // Split key-value pairs and return an array of objects
      return param.map((pair) => {
        const [key, ...value] = pair.split(":");
        if (!key)
          throw new Error("Missing key for parameter. Expected key:value");
        if (!value.length)
          throw new Error("Missing value for parameter. Expected key:value");
        return { [key]: value.join(":") };
      });
    },
  })
  .option("root", {
    describe: "Folder where to run context",
    type: "string",
    alias: "r",
  })
  .option("output", {
    describe:
      "optional folder where to base output file writting as opposed to root",
    type: "string",
    alias: "r",
  })
  .help().argv;

let entries = argv["entry"]?.map((e) => {
  let extension = ".bgat";
  if (e.slice(-5, e.length) !== extension) return e + extension;
  return e;
});
let params = argv["parameter"] || [];
let root = argv["root"];
let output = argv["output"];

console.log("ARGS", entries, params);
console.log("ARGV", argv);
for (let file of entries) {
  let ctx = new ParserContext();
  root = path.resolve(process.cwd(), root || "");
  ctx.root = root;
  if (output) ctx.output = path.resolve(__dirname, output);
  const filePath = path.resolve(root, file);
  ctx.filename = filePath;

  let code = fs.readFileSync(filePath, "utf-8");
  if (!code) throw new Error(`file ${file} not found`);
  console.log("Flie Content: \n", code);

  ctx.pushCode(code);
  ctx.tokenizeCode();
  let parameters = params.map((p) => {
    let key = Object.keys(p)[0];
    let value = Object.values(p)[0];
    let name = key;
    if (name[0] !== "$") name = "$" + name;
    let variable = new VariableContext(VariableType.PARAM, name, value);
    console.log("Var", variable);
    return variable;
  });
  ctx.exec(parameters);
}
