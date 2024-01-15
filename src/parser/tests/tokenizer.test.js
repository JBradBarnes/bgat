const { templateTokenizer } = require("../tokenizeCommand");

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
