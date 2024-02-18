let {
  TokenType,
  DECLARATIONS,
  BehaviorTypes,
  SystemTypes,
  STRING_TYPES,
  Statics,
  ParserToken,
} = require("common/core/Token/types");

/**
 * Tokenize a command string.
 *
 * @param {string} cmd - The command string to tokenize.
 * @param {number} [line=0] - The line number (optional, default is 0).
 * @returns {ParserToken[]} An array of ParserToken objects.
 * @throws {Error} Throws an error if there's an issue with tokenization.
 */
function tokenize(cmd, ctx = {}) {
  let tokensText = cmd
    .trim()
    .match(/("[^"]*"|'[^']*'|`[^`]*`|\$?\w+|\.|\(|\)|,)/g);

  let tokenBuilder = "";
  // build case null|list|method
  let buildCase = null;
  let buildNestLevel = 0;
  let resetBuildCase = () => {
    tokenBuilder = "";
    buildCase = null;
    buildNestLevel = 0;
  };

  let lineLocation = 0;
  tokensText = tokensText.filter((x) => x);
  let tokens = [];
  for (let txt of tokensText) {
    let text = txt.trim();
    if (buildCase === "method") {
      text = "." + text;
      resetBuildCase();
    } else if (buildCase === "list") {
      tokenBuilder += text;
      if (text === "(") buildNestLevel++;
      if (text === ")") {
        buildNestLevel--;
        if (buildNestLevel <= 0) {
          text = tokenBuilder;
          resetBuildCase();
        }
      }
    } else {
      if (text == "(") {
        tokenBuilder = "(";
        buildCase = "list";
        buildNestLevel++;
      } else if (text === ".") {
        tokenBuilder = ".";
        buildCase = "method";
      }
    }
    if (buildCase) continue;
    try {
      let token = identifyToken(text.trim(), ctx);
      token.lineLocation = lineLocation;
      token.line = ctx.line;
      tokens.push(token);
    } catch (e) {
      if (ctx.line === null) throw e;
      throw new Error(`line: ${ctx.line} ${cmd} \n` + e.message);
    }
    lineLocation += txt.length;
  }
  return tokens;
}

/**
 * Identify a token from a given text.
 *
 * @param {string} txt - The text of the token.
 * @param {boolean} [isInExpression=false] - Whether the token is inside an expression (optional, default is false).
 * @returns {ParserToken} A ParserToken object.
 * @throws {Error} Throws an error if there's an issue with identifying the token.
 */
function identifyToken(txt, ctx, isInExpression = false) {
  let token;
  if (txt[0] === "`") {
    if (txt[txt.length - 1] != "`")
      throw new Error(
        "Unclosed template string. (`) expected. \n token: " + txt
      );
    token = new ParserToken(
      TokenType.TEMPLATE,
      txt,
      templateTokenizer(txt.slice(1, -1), ctx)
    );
    // list
  } else if (txt[0] === "(") {
    if (txt[txt.length - 1] != ")")
      throw new Error("Unclosed list. ) expected. \n token: " + txt);
    token = new ParserToken(
      TokenType.LIST,
      txt,
      splitByComma(txt.slice(1, txt.length - 1)).map((t) =>
        tokenize(t.trim(), ctx)
      )
    );
  } else if (txt[0] === "'") {
    if (txt[txt.length - 1] != "'")
      throw new Error(
        "Unclosed template string. (`) expected. \n token: " + txt
      );
    token = new ParserToken(TokenType.STRING, txt.slice(1, -1));
  } else if (txt[0] === '"') {
    if (txt[txt.length - 1] != '"')
      throw new Error(
        'Unclosed template string. (") expected. \ntoken: ' + txt
      );
    token = new ParserToken(TokenType.STRING, txt.slice(1, -1));
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
function templateTokenizer(str, ctx) {
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
          .map((ex) => identifyToken(ex, ctx, true))
      );
    }
  }
  if (isInExpression)
    throw new Error("Unclosed template expression. (}) Expected");
  return children;
}

function splitByComma(str) {
  let result = [];
  let insideString = false;
  let parenthesesCount = 0;
  let currentChunk = "";

  for (let char of str) {
    if (char === '"' || char === "'") {
      insideString = !insideString;
    }

    if (!insideString) {
      if (char === "(") {
        parenthesesCount++;
      } else if (char === ")") {
        parenthesesCount--;
      }

      if (char === "," && parenthesesCount === 0) {
        result.push(currentChunk.trim());
        currentChunk = "";
        continue;
      }
    }

    currentChunk += char;
  }

  result.push(currentChunk.trim());

  return result;
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
