const { ParserToken } = require("./paserContext");

function tokenize(cmd, line = 0, allowOnlyExpressions = false) {
  let tokensText = cmd.trim().match(/("[^"]*"|'[^']*'|`[^`]*`|\S+)/g);
  let tokens = [];
  for (let txt in tokensText) {
    let text = txt.trim();
    try {
      let token = identifyToken(text.trim());
      tokens.push(token);
    } catch (e) {
      throw new Error(`line: ${line} ${cmd} \n` + e.message);
    }
  }
  return tokens;
}

const TokenType = {
  TEMPLATE: "template",
  STRING: "string",
  TYPE: "type",
  VARIABLE: "variable",
  METHOD: "method",
  FROM: "from",
  TO: "to",
  DEFAULT: "default",
  CMD: "cmd",
};

const DECLARATIONS = [
  TokenType.TYPE,
  TokenType.FROM,
  TokenType.TO,
  TokenType.DEFAULT,
];

const Types = {
  PARAM: "param",
  BUFFER: "buf",
  CONST: "const",
  LIST: "list",
};

function identifyToken(txt, isInExpression = false) {
  let token;
  if (txt[0] === "`") {
    if (txt[txt.length - 1] != "`")
      throw new Error(
        "Unclosed template string. (`) expected. \n token: " + txt
      );
    token = new ParserToken(TokenType.TEMPLATE, txt, templateTokenizer(txt));
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
  } else if (Object.values(Types).includes(txt)) {
    token = new ParserToken(TokenType.TYPE, txt);
  } else if (Object.values(TokenType).includes(txt)) {
    token = new ParserToken(txt, txt);
  } else {
    throw new Error(`Unexpected token (${txt})`);
  }
  if (isInExpression && DECLARATIONS.includes(token.type))
    throw new Error(`Declaration: (${txt}) not allowed in template expression`);
  return token;
}

function templateTokenizer(str) {
  let childrenRaw = str.split(/(?<!\\){(.*?[^\\])}(?<!\\)/);
  let children = [];
  // to flip false right away
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
};
