const { ParserContext } = require("../paserContext");
const { fileStub } = require("./testStubs");

describe("Statement unit", () => {
  test("A Statement will usually consist of a single line", () => {
    // 11 non empty lines are
    let file = fileStub;
    let ctx = new ParserContext();
    ctx.pushCode(file);
    expect(ctx.commands.length).toBe(11);
  });

  test("In cases of templates the template can allow more lines in a single statement", () => {
    let file = `
    param $platform
    buf $template from \`
      // this is a test file
      import React from "react";
      import Route from "react-native-{$platform}"
    \`
    `;
    let ctx = new ParserContext();
    ctx.pushCode(file);
    expect(ctx.commands.length).toBe(2);
  });

  test("In cases of escapse within templates line number still works", () => {
    let file = `
    param $platform
    buf $template from \`
      const str = \\\`
      A string
      \\\`
    \`
    `;
    let ctx = new ParserContext();
    ctx.pushCode(file);
    expect(ctx.commands.length).toBe(2);
  });

  // use this latter for now no nested templates
  // test("Nested templates line number still works", () => {
  //   let file = `
  //   param $platform
  //   buf $template from \`
  //     const str = {$platform.append \`
  //       Nested Template
  //     \`}
  //   \`
  //   `;
  //   let ctx = new ParserContext();
  //   ctx.pushCode(file);
  //   // expect(ctx.commands.length).toBe(2);
  // });

  // for now expect to throw until fixed
  test("Nested templates throw", () => {
    let file = `
    param $platform
    buf $template from \`
      const str = {$platform.append \`
        Nested Template
      \`}
    \`
    `;
    let ctx = new ParserContext();
    expect(() => ctx.pushCode(file)).toThrow();
  });

  // test("Each command should end in a string unless it is a variable declaration", () => {

  // })
});
