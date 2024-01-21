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
