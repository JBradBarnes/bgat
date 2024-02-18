let { TokenType } = require("common/core/Token/types");
const { templateTokenizer, tokenize } = require("../tokenizeCommand");

test("Template splits children correctly", () => {
  let str = "here {$var} there";
  let tokens = templateTokenizer(str);
  expect(tokens.length).toBe(3);
  expect(tokens[0]).toBe("here ");
  expect(tokens[2]).toBe(" there");

  str = `\{ `;
  expect(templateTokenizer(str).length).toBe(1);
});

test("Template should throw when declaration is in expression", () => {
  let str = "here {buf $var} there";
  expect(() => templateTokenizer(str)).toThrow();
});

test("Lists work as parts of tokenization", () => {
  let str = `("1","2","3")`;
  let tokens = tokenize(str);
  expect(tokens[0].type).toBe(TokenType.LIST);
});

test("Lists and methods should split lists and methods", () => {
  let str = `List("(1)","2","3").push("4")`;
  let tokens = tokenize(str);
  expect(tokens[0].text).toBe("List");
  expect(tokens[1].text).toBe(`("(1)","2","3")`);
  expect(tokens[2].text).toBe(".push");
  expect(tokens[3].text).toBe(`("4")`);
});
