const { ParserContext } = require("../paserContext");

const filename = "_hello.txt";
const fileContent = "hello world";

const stringWrite = `
File.write ("${filename}","${fileContent}")
`;

afterAll(() => {
  // need a cleanup file to use node to delete all files in this folder that begin with an underscore
});

test("does write file", () => {
  let ctx = new ParserContext();
  ctx.pushCode(stringWrite);
  ctx.exec();
  // need node test to see if file exists and if file contents match syncronus
});
