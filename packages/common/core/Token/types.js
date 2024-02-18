/**
 * Token types.
 * @enum {string}
 */
const TokenType = {
  LIST: "list",
  REFINEDLIST: "refinedlist",
  TEMPLATE: "template",
  STRING: "string",
  TYPE: "type",
  VARIABLE: "variable",
  METHOD: "method",
  STATIC: "static",
  FROM: "from",
  TO: "to",
  DEFAULT: "default",
  // CMD: "cmd",
};

/**
 * Token declarations.
 * @enum {string}
 */
const DECLARATIONS = [
  TokenType.TYPE,
  TokenType.FROM,
  TokenType.TO,
  TokenType.DEFAULT,
];

/**
 * Behavior Types.
 * @enum {string}
 */
const BehaviorTypes = {
  PARAM: "param",
  BUFFER: "buf",
  CONST: "const",
  LIST: "list",
};

/**
 * System Types.
 * @enum {string}
 */
const SystemTypes = {
  STRING: "string",
  LIST: "list",
};

/**
 * Token declarations.
 * @enum {string}
 */
const STRING_TYPES = [
  BehaviorTypes.BUFFER,
  BehaviorTypes.CONST,
  BehaviorTypes.PARAM,
];

/**
 * List.
 * @enum {string}
 */
const Statics = {
  LIST: "List",
  FILE: "File",
  Cmd: "Cmd",
  STRING: "String",
};
class ParserToken {
  constructor(typ, text, children = []) {
    this.type = typ;
    this.text = text;
    this.children = children;
    this.variable = null;
    this.variableToken = null;
  }
}

module.exports = {
  TokenType,
  DECLARATIONS,
  BehaviorTypes,
  SystemTypes,
  STRING_TYPES,
  Statics,
  ParserToken,
};
