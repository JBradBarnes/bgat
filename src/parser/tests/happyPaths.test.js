const { ParserContext } = require("../paserContext");
const fs = require("fs");

const filename = "_hello.txt";
const fileContent = "hello world";

const stringWrite = `
File.write ("${filename}","${fileContent}")
`;

// afterAll(() => {
//   // Clean up: Delete files that begin with an underscore
//   const files = fs.readdirSync(__dirname);
//   for (const file of files) {
//     if (file.startsWith("_")) {
//       fs.unlinkSync(file);
//     }
//   }
// });

test("does write file", () => {
  let ctx = new ParserContext();
  ctx.pushCode(stringWrite);
  ctx.exec();

  // Check if the file was created
  const filePath = __dirname + "/" + filename;
  expect(fs.existsSync(filePath)).toBe(true);

  // Read the content of the file and compare it with the expected content
  const fileContentRead = fs.readFileSync(filePath, "utf8");
  expect(fileContentRead).toBe(fileContent);
});
