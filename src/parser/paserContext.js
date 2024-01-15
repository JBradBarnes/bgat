let { stripComments } = require("./stripComments");
const { splitStatements: splitCommands } = require("./tests/splitStatements");
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
  typeCheckCode = () => {};
}

class ParserToken {
  constructor(typ, text, children = []) {
    this.type = typ;
    this.text = text;
    this.children = children;
  }
}

module.exports = {
  ParserContext,
  ParserToken,
};
