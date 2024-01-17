const { ParserContext } = require("../paserContext");
const {
  templateTokenizer,
  tokenize,
  TokenType,
} = require("../tokenizeCommand");

test("For binding purposes litterals cannot be method called", () => {
  let str = `("1","2","3").push("4")`;
  let ctx = new ParserContext();
  expect(() => ctx.mountCode(str)).toThrow();

  ctx.clearParsed();
  str = `"UPPER".to_lower`;
  expect(() => ctx.mountCode(str)).toThrow();

  ctx.clearParsed();
  str = "`UPPER`.to_lower";
  expect(() => ctx.mountCode(str)).toThrow();

  ctx.clearParsed();
  str = "'UPPER'.to_lower";
  expect(() => ctx.mountCode(str)).toThrow();
});

test("The correct syntax for above is to use a Static Constructor", () => {
  let str = `List("1","2","3").push("4")`;
  expect(() => tokenize(str)).not.toThrow();

  str = `String("UPPER").to_lower`;
  expect(() => tokenize(str)).not.toThrow();

  str = "String(`UPPER`).to_lower";
  expect(() => tokenize(str)).not.toThrow();

  str = "String('UPPER').to_lower";
  expect(() => tokenize(str)).not.toThrow();
});
