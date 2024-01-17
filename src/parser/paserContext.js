let { stripComments } = require("./stripComments");
const { checkSyntax } = require("./syntaxCheckCmd");
const { splitStatements: splitCommands } = require("./splitStatements");
const { tokenize } = require("./tokenizeCommand");

class ParserContext {
  constructor() {
    this.newContext();
  }
  newContext = () => {
    this.root = __dirname || "";
    this.commands = [];
    this.clearParsed();
  };
  clearParsed = () => {
    this.commandTokens = [];
    this.lists = [];
    this.parameters = [];
    this.buffers = [];
    this.filename = "";
  };
  pushCode = (code, filename) => {
    this.filename = filename;
    let lines = stripComments(code);
    this.commands.push(...splitCommands(lines));
  };
  tokenizeCode = () => {
    try {
      this.commandTokens = tokenize(this.commands);
    } catch (e) {
      throw new Error(`Syntax Error in file: ${this.filename}\n`);
    }
  };
  syntaxCheckStatements = () => {
    let errors = [];
    this.commandTokens.forEach((t, i) => {
      try {
        checkSyntax(t);
      } catch (e) {
        errors.push(e);
      }
    });
    throw new Error(errors.join("\n"));
  };
  typeCheckCode = () => {};
  mountCode = (str) => {
    this.pushCode(str);
    this.syntaxCheckStatements();
    this.typeCheckCode();
  };
}

const VariableType = {
  LIST: "list",
  PARAM: "param",
  CONST: "const",
  BUFFER: "buf",
};
class VariableContext {
  constructor(typ, text, value = "") {
    this.type = typ;
    this.name = text;
    this.value = value || (typ === VariableType.LIST ? [] : "");
  }
}

module.exports = {
  ParserContext,
  VariableContext,
  VariableType,
};
