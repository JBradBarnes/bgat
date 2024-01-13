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
}

class ParserToken {
  constructor(typ, name, children = []) {
    this.type = typ;
    this.name = name;
    this.children = children;
  }
}

module.exports = {
  ParserContext,
};
