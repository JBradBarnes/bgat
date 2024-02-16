const { ParserContext } = require("../paserContext");
const fs = require("fs");

const filename = "_hello.txt";
const fileContent = "hello world";

const stringWrite = `
File.write ("${filename}","${fileContent}")
`;

afterEach(() => {
  // Clean up: Delete files that begin with an underscore
  const files = fs.readdirSync(__dirname);
  for (const file of files) {
    if (file.startsWith("_")) {
      fs.unlinkSync(__dirname + "/" + file);
    }
  }
});

const runCode = (code) => {
  let ctx = new ParserContext();
  ctx.root = __dirname;
  ctx.pushCode(code);
  ctx.tokenizeCode();
  ctx.exec();
  return ctx;
};

const testFile = (filename, fileContent) => {
  // Check if the file was created
  const filePath = __dirname + "/" + filename;
  expect(fs.existsSync(filePath)).toBe(true);

  // Read the content of the file and compare it with the expected content
  const fileContentRead = fs.readFileSync(filePath, "utf8");
  expect(fileContentRead).toBe(fileContent);
};

test("does write file", () => {
  runCode(stringWrite);
  testFile(filename, fileContent);
});

const writeWithVar = `
buf $file from "${fileContent}"
File.write ("${filename}", $file)
`;

test("does write file thru var", () => {
  runCode(writeWithVar);
  testFile(filename, fileContent);
});

const writeBlob = `
list $tilemaps from File.glob "*.tmx"
File.write ("${filename}", $tilemaps.join "\n")
`;

test("does write glob", () => {
  runCode(writeBlob);
  testFile(filename, "tilemap2.tmx\ntilemap.tmx");
});

let replaceCode = `
buf $str from "here to there"
File.write("${filename}", $str.replace("here", "there"))
`;

test("does use str to str", () => {
  runCode(replaceCode);
  testFile(filename, "there to there");
});

let sliceCode = `
buf $str from "01234"
File.write("${filename}", $str.slice("2","4"))
`;

test("does use str to str", () => {
  runCode(sliceCode);
  testFile(filename, "23");
});

let regexCode = `
buf $str from "01234"
File.write("${filename}", $str.regex_replace("[23]","5"))
`;

test("does use regex str to str", () => {
  runCode(regexCode);
  testFile(filename, "01534");
});

let listCode = `
list $list from ("0","1","2","3")
File.write("${filename}",$list.join(""))
`;

test("does use lists", () => {
  runCode(listCode);
  testFile(filename, "0123");
});

let readCode = `
buf $file from File.read("${filename}")
File.write("${filename}",$file.concat("Read File"))
`;

test("does read file", () => {
  runCode(listCode);
  runCode(readCode);
  testFile(filename, "0123" + "Read File");
});

const runAdd = "runAdd";

const setVar = `
buf $file from "${fileContent}"
$file.set('${runAdd}')
File.write ("${filename}", $file)
`;

test("does set var", () => {
  runCode(setVar);
  testFile(filename, runAdd);
});

const writeWithRun = `
buf $file from "${fileContent}"
Cmd.run("$file.set('${runAdd}')")
File.write ("${filename}", $file)
`;

test("does run code", () => {
  runCode(writeWithRun);
  testFile(filename, runAdd);
});

const cliShell = `
Cmd.shell("bgat --entry tilemaps --root ${__dirname}/../../../examples/typescript_scenes")
`;

test("does run cli", () => {
  runCode(cliShell);
});

const writeWithShell = `
buf $file from "${fileContent}"
$file.set(Cmd.shell("echo '${runAdd}'"))
File.write ("${filename}", $file)
`;
test("shell cmd works", () => {
  runCode(writeWithShell);
  // echo adds a new line?
  testFile(filename, runAdd + "\n");
});

const chaining = `
buf $index from "1"
buf $sub from "this."
File.write ("${filename}", $sub.concat('index:').concat($index)")
`;
test("chaining works", () => {
  runCode(chaining);
  testFile(filename, "this.index:1");
});

const templateTest = `
buf $item from "1"
 buf $index from "0"
File.write ("${filename}", \`item:{$item} index:{$index}\`)
`;
test("template works", () => {
  runCode(templateTest);
  testFile(filename, "item:1 index:0");
});

const mapList = `
list $list from ("1","2","3")
File.write("${filename}", $list.map("\`item:{$item} index:{$index}\`").join("\n"))
`;
test("list cmd map works", () => {
  runCode(mapList);
  testFile(
    filename,
    `item:1 index:0
item:2 index:1
item:3 index:2`
  );
});
