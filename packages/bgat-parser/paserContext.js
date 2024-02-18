const { stripComments } = require("./stripComments");
const { checkSyntax } = require("./syntaxCheckCmd");
const { executeCmd } = require("./executeCmd");
const { VariableContext, VariableType } = require("common/core/Variable/types");
const { splitStatements: splitCommands } = require("./splitStatements");
const { tokenize } = require("./tokenizeCommand");

/**
 * Represents the context for parsing and executing commands.
 * @class
 */
class ParserContext {
  /**
   * Creates a new ParserContext.
   * @constructor
   * @param {Object} options - Configuration options.
   * @param {boolean} [options.isChild=false] - Indicates if the context is a child context.
   */
  constructor({ isChild = false } = {}) {
    /**
     * Root directory path.
     * @type {string}
     */
    this.root = __dirname || "";

    /**
     * optional folder where to base output file writting as opposed to root.
     * @type {string}
     */
    this.output = "";

    /**
     * Array of command strings to be parsed and executed.
     * @type {string[]}
     */
    this.commands = [];

    this.clearParsed();

    /**
     * Indicates if the context is a child context.
     * @type {boolean}
     */
    this.isChild = isChild;
  }

  /**
   * Initializes a new context with default values.
   * @private
   */
  newContext = () => {
    this.root = __dirname || "";
    this.commands = [];
    this.clearParsed();
  };

  /**
   * Clears parsed information in the context.
   * @private
   */
  clearParsed = () => {
    /**
     * Array of tokens representing parsed commands.
     * @type {Object[]}
     */
    this.commandTokens = [];

    /**
     * Name of the current file being processed.
     * @type {string}
     */
    this.filename = "";

    this.clearExecCtx();

    /**
     * Current line number being processed.
     * @type {number}
     */
    this.line = 0;
  };

  /**
   * Clears the execution context.
   * @private
   */
  clearExecCtx = () => {
    /**
     * Array of variables in the execution context.
     * @type {Object[]}
     */
    this.variables = [];
  };

  /**
   * Pushes code to the context for parsing and execution.
   * @param {string} code - The code to be processed.
   * @param {string} filename - The name of the file containing the code.
   */
  pushCode = (code, filename) => {
    this.filename = filename;
    let lines = stripComments(code);
    this.commands.push(...splitCommands(lines));
  };

  /**
   * Tokenizes the commands in the context.
   * @throws {Error} Throws an error if a syntax error is encountered.
   */
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

  /**
   * Checks the syntax of the parsed statements.
   * @throws {Error} Throws an error if a syntax error is encountered.
   */
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

  /**
   * Type-checks the code in the context.
   */
  typeCheckCode = () => {
    // Implementation pending...
  };

  /**
   * Mounts code to the context, pushing it for parsing, syntax checking, and type checking.
   * @param {string} str - The code to be processed.
   */
  mountCode = (str) => {
    this.pushCode(str);
    this.syntaxCheckStatements();
    this.typeCheckCode();
  };

  /**
   * Executes the parsed commands in the context.
   * @param {Object[]} [params=[]] - An array of parameters for execution.
   * @returns {string} The result of the execution.
   */
  exec = (params = []) => {
    if (!this.isChild) this.clearExecCtx();
    this.runVarCtx = new VariableContext(
      VariableType.BUFFER,
      "$__current__",
      ""
    );
    this.variables.unshift(this.runVarCtx);
    this.variables.unshift(...params);
    let result = "";
    for (let cmd of this.commandTokens) {
      result = executeCmd(cmd, this);
    }
    return result;
  };

  /**
   * Creates a new child context.
   * @param {Object[]} [params=[]] - An array of parameters for the child context.
   * @returns {ParserContext} The new child context.
   */
  newChildContext = (params = []) => {
    let newCtx = new ParserContext({ isChild: true });
    newCtx.variables = [...params, ...this.variables];
    return newCtx;
  };

  /**
   * Retrieves the variable context by name.
   * @param {string} name - The name of the variable.
   * @param {boolean} shouldThrow - Throw if not found.
   * @throws {Error} Throws an error if the variable is not in scope or undefined.
   * @returns {Object} The variable context.
   */
  getVariableCtx = (name, shouldThrow = true) => {
    let variableCtx = this.variables.find(
      (v) => v.name === name || v.alias.includes(name)
    );
    if (!variableCtx && shouldThrow)
      throw new Error(`Variable ${name} is not in scope or undefined`);
    return variableCtx;
  };

  /**
   * Retrieves the run variable context.
   * @returns {Object} The run variable context.
   */
  getRunVarCtx = () => this.getVariableCtx("$__current__");
}

/**
 * Module exports the ParserContext class.
 * @module
 */
module.exports = {
  ParserContext,
};
