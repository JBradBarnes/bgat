let { stripComments } = require("./stripComments");
const { checkSyntax } = require("./syntaxCheckCmd");
const { executeCmd } = require("./executeCmd");
const { VariableContext, VariableType } = require("./variableContext");
const { splitStatements: splitCommands } = require("./splitStatements");
const { tokenize } = require("./tokenizeCommand");

class ParserContext {
  constructor({ isChild = false } = {}) {
    this.newContext();
    this.isChild = isChild;
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
    this.line = 0;
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
        this.commandTokens.push(tokenize(cmd, this));
      } catch (e) {
        errors.push(e);
      }
      this.line++;
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
    if (!this.isChild) this.clearExecCtx();
    let runVarCtx = new VariableContext(
      VariableType.BUFFER,
      "$__current__",
      ""
    );
    this.variables.push(runVarCtx);
    for (let { name, value } of params) {
      this.variables.push(new VariableContext(VariableType.PARAM, name, value));
    }
    let result = "";
    for (let cmd of this.commandTokens) {
      result = executeCmd(cmd, this);
    }
    return result;
  };
  newChildContext = (params = []) => {
    let newCtx = new ParserContext({ isChild: true });
    newCtx.variables = [...params, ...this.variables];
    return newCtx;
  };
  getVariableCtx = (name) => {
    let variableCtx = this.variables.find(
      (v) => v.name === name || v.alias.includes(name)
    );
    if (!variableCtx)
      throw new Error(`Variable ${name} is not in scope or undefined`);
    return variableCtx;
  };
  getRunVarCtx = () => this.getVariableCtx("$__current__");
}

module.exports = {
  ParserContext,
};
