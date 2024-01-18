let { stripComments } = require("./stripComments");
const { checkSyntax } = require("./syntaxCheckCmd");
const { executeCmd } = require("./executeCmd");
const { VariableContext } = require("./variableContext");
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
    this.filename = "";
    this.clearExecCtx();
  };
  clearExecCtx = () => {
    this.variables = [];
  };
  pushCode = (code, filename) => {
    this.filename = filename;
    let lines = stripComments(code);
    this.commands.push(...splitCommands(lines));
  };
  tokenizeCode = () => {
    let errors = [];
    for (let cmd of this.commands) {
      try {
        this.commandTokens.push(tokenize(cmd));
      } catch (e) {
        errors.push(e);
      }
    }
    if (errors.length) {
      throw new Error(
        `Syntax Error in file: ${this.filename}\n${errors.join("\n")}`
      );
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
  exec = (params = []) => {
    this.clearExecCtx();
    for (let { name, value } of params) {
      push(new VariableContext(VariableType.PARAM, name, value));
    }
    for (let cmd of this.commandTokens) {
      executeCmd(cmd, this);
    }
  };
}

module.exports = {
  ParserContext,
};
