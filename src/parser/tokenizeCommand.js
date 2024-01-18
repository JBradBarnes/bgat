/**
 * Tokenize a command string.
 *
 * @param {string} cmd - The command string to tokenize.
 * @param {number} [line=0] - The line number (optional, default is 0).
 * @returns {ParserToken[]} An array of ParserToken objects.
 * @throws {Error} Throws an error if there's an issue with tokenization.
 */
function tokenize(cmd, line = 0) {
  let tokensText = cmd
    .trim()
    .match(/("[^"]*"|'[^']*'|`[^`]*`|\w+|\.|\(|\)|,)/g);

  let tokenBuilder = "";
  // build case null|list|method
  let buildCase = null;

  tokensText = tokensText.filter((x) => x);
  let tokens = [];
  for (let txt of tokensText) {
    let text = txt.trim();
    if (buildCase === "method") {
      text = "." + text;
      tokenBuilder = "";
      buildCase = null;
    } else if (buildCase === "list") {
      tokenBuilder += text;
      if (text === ")") {
        text = tokenBuilder;
        tokenBuilder = "";
        buildCase = null;
      }
    } else {
      if (text == "(") {
        tokenBuilder = "(";
        buildCase = "list";
      } else if (text === ".") {
        tokenBuilder = ".";
        buildCase = "method";
      }
    }
    if (buildCase) continue;
    try {
      let token = identifyToken(text.trim());
      tokens.push(token);
    } catch (e) {
      if (line === null) throw e;
      throw new Error(`line: ${line} ${cmd} \n` + e.message);
    }
  }
  return tokens;
}

// function buildToken(tokenBuilder, buildCase, )

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
  }
}

/**
 * Identify a token from a given text.
 *
 * @param {string} txt - The text of the token.
 * @param {boolean} [isInExpression=false] - Whether the token is inside an expression (optional, default is false).
 * @returns {ParserToken} A ParserToken object.
 * @throws {Error} Throws an error if there's an issue with identifying the token.
 */
function identifyToken(txt, isInExpression = false) {
  let token;
  if (txt[0] === "`") {
    if (txt[txt.length - 1] != "`")
      throw new Error(
        "Unclosed template string. (`) expected. \n token: " + txt
      );
    token = new ParserToken(TokenType.TEMPLATE, txt, templateTokenizer(txt));
    // list
  } else if (txt[0] === "(") {
    if (txt[txt.length - 1] != ")")
      throw new Error("Unclosed list. ) expected. \n token: " + txt);
    token = new ParserToken(
      TokenType.LIST,
      txt,
      txt
        .slice(1, txt.length - 1)
        .split(",")
        .map((t) => tokenize(t.trim(), null))
    );
  } else if (txt[0] === "'") {
    if (txt[txt.length - 1] != "'")
      throw new Error(
        "Unclosed template string. (`) expected. \n token: " + txt
      );
    token = new ParserToken(TokenType.STRING, txt);
  } else if (txt[0] === '"') {
    if (txt[txt.length - 1] != '"')
      throw new Error(
        'Unclosed template string. (") expected. \ntoken: ' + txt
      );
    token = new ParserToken(TokenType.STRING, txt);
  } else if (txt[0] === "$") {
    token = new ParserToken(TokenType.VARIABLE, txt);
  } else if (Object.values(BehaviorTypes).includes(txt)) {
    token = new ParserToken(TokenType.TYPE, txt);
  } else if (Object.values(TokenType).includes(txt)) {
    token = new ParserToken(txt, txt);
  } else if (txt.includes(".")) {
    let split = txt.split(".");
    let [_, methodName] = split;
    if (!methodName) throw new Error(`Method name required in ${txt}`);
    token = new ParserToken(TokenType.METHOD, txt);
  } else if (Object.values(Statics).includes(txt)) {
    token = new ParserToken(TokenType.STATIC, txt);
  } else {
    throw new Error(`Unexpected token (${txt})`);
  }
  if (isInExpression && DECLARATIONS.includes(token.type))
    throw new Error(`Declaration: (${txt}) not allowed in template expression`);
  return token;
}

/**
 * Tokenize a template string.
 *
 * @param {string} str - The template string.
 * @returns {(string[]|ParserToken[][])} An array of strings or an array of arrays of ParserToken objects.
 * @throws {Error} Throws an error if there's an issue with tokenizing the template string.
 */
function templateTokenizer(str) {
  let childrenRaw = str.split(/(?<!\\){(.*?[^\\])}(?<!\\)/);
  let children = [];
  let isInExpression = true;
  for (let child of childrenRaw) {
    isInExpression = !isInExpression;
    if (!child) {
      if (isInExpression) throw new Error("Empty Template Expression");
      else break;
    }
    if (!isInExpression) children.push(child);
    else {
      let expressions = child.split(/\s/g);
      children.push(
        expressions
          .filter((s) => !!s.trim())
          .map((ex) => identifyToken(ex, true))
      );
    }
  }
  if (isInExpression)
    throw new Error("Unclosed template expression. (}) Expected");
  return children;
}

module.exports = {
  tokenize,
  templateTokenizer,
  TokenType,
  DECLARATIONS,
  BehaviorTypes,
  SystemTypes,
  STRING_TYPES,
  Statics,
  ParserToken,
};
