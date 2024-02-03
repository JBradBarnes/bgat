const { Builtins } = require("../methods");
const { ParserContext } = require("../paserContext");

const mockContext = new ParserContext();

test("Globs should load filenames", () => {
  mockContext.root = __dirname;
  let ctx = { ...mockContext, subject: [], subjectType: "list" };
  let files = Builtins.File.glob(ctx, ["*.bgat"]);
  expect(files?.length).toBeTruthy();
});
