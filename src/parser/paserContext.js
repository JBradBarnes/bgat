let { stripComments } = require("./stripComments");
const { splitStatements: splitCommands } = require("./tests/splitStatements");

class ParserContext {
  constructor() {
    this.newContext();
  }
  newContext = () => {
    this.commands = [];
    this.clearParsed();
  };
  clearParsed = () => {
    this.commandTokens = [];
    this.lists = [];
    this.parameters = [];
    this.buffers = [];
  };
  pushCode = (code) => {
    let lines = stripComments(code);
    this.commands.push(...splitCommands(lines));
  };
  tokenize = () => {};
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
