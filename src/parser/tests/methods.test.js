const { Builtins } = require("../methods");
const { ParserContext } = require("../paserContext");

const mockContext = new ParserContext();

test("Globs should load filenames", () => {
  let ctx = { ...mockContext, subject: [], subjectType: "list" };
  let files = Builtins.glob.impl(ctx, "./**/**.bgat");
  expect(files?.length).toBeTruthy();
});
