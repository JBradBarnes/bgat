const { VariableContext, VariableType } = require("./variableContext");
const { ParserToken, TokenType, Statics } = require("./tokenizeCommand");
const { Method } = require("./methods");
const { ParserContext } = require("./paserContext");

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function executeCmd(cmdTokens = [], ctx) {
  let isVarDeclaration = cmdTokens[0].TokenType === TokenType.TYPE;
  if (isVarDeclaration) {
    execVarDeclaration(cmdTokens, ctx);
  } else {
    exec(cmdTokens, ctx);
  }
}

/**
 * @param {ParserToken[]} cmdTokensProp - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function exec(cmdTokensProp = [], ctx) {
  let cmdTokens = [...cmdTokensProp];
  let subject = null;
  while (cmdTokens.length) {
    let tokenTyp = cmdTokens[0].type;
    let firstIsValue =
      tokenTyp === TokenType.STRING ||
      tokenTyp === TokenType.LIST ||
      tokenTyp === TokenType.REFINEDLIST;
    if (firstIsValue) {
      if (cmdTokens.length > 1)
        throw new Error(
          `Unexpected code following litteral ${cmdTokens[0].text} ${cmdTokens
            .slice(1)
            .map((t) => t.text)
            .join()}`
        );
      return cmdTokens[0];
    }
    if (!subject) subject = cmdTokens.unshift();
    let method = cmdTokens.unshift();
  }
}

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function execVarDeclaration(cmdTokens = [], ctx) {
  let newVar = new VariableContext(
    cmdTokens[0].text,
    cmdTokens[1].text,
    cmdTokens[0].text === "list" ? [] : ""
  );
  if (cmdTokens.length > 3)
    newVar.value = exec(cmdTokens.slice(3), ctx.variables).value;
  return newVar;
}

/**
 * @param {ParserToken[]} children - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function execMethod(
  [subject, methodToken, list = new ParserToken(TokenType.REFINEDLIST, "", [])],
  ctx
) {
  let text =
    subject.text + methodToken.text + list.type === TokenType.REFINEDLIST
      ? ""
      : list.text;
  let listToken = { ...list };
  if (list.type !== TokenType.REFINEDLIST)
    listToken = { ...execList(list.children), text: list.text };
  let subjectType = getMethodTypeFromToken(subject, ctx.variables);
  let methodName = methodToken.text.slice(1);
  let method = getMethod(subjectType, methodName);
  let { returnType } = method;
  let newTokenTyp =
    returnType === Statics.LIST ? TokenType.REFINEDLIST : TokenType.STRING;
  try {
    let value = method.impl(
      {
        subject,
        ctx,
      },
      listToken.children
    );

    let newToken = new ParserToken(
      newTokenTyp,
      newTokenTyp === TokenType.REFINEDLIST ? text : value,
      newTokenTyp === TokenType.REFINEDLIST ? value : undefined
    );

    return newToken;
  } catch (e) {
    throw new Error(
      `Issue in method execution ${subject.text}${methodToken.text}\n${e.messge}`
    );
  }
}

/**
 * @param {Statics} subjectType - The parsed tokens in command.
 * @param {string} methodName - The name of the method.
 * @param {Method[]=BuiltinMethods} ctx - The name of the method.
 **/
function getMethod(subjectType, methodName, methods = BuiltinMethods) {
  let meth = methods.find(
    (m) => m.bindType === subjectType && m.name === methodName
  );
  if (!meth) throw new Error("Undefined Method");
  return meth;
}

/**
 * @param {ParserToken} token - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function getMethodTypeFromToken(token, ctx) {
  switch (token.type) {
    case TokenType.VARIABLE: {
      let variable = ctx.variables.find((v) => v.name === token.text);
      if (!variable) throw new Error(`Undefined variable ${token.text}`);
      return variable.type.toLowercase === "list"
        ? Statics.LIST
        : Statics.STRING;
    }
    case TokenType.STATIC: {
      return token.text;
    }
    default: {
      throw new Error(
        `${token.text} is not a static or variable and cannot be used as the subject of a method`
      );
    }
  }
}

/**
 * @param {ParserToken[]} children - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function execList(children = [], ctx) {
  let refinedListToken = new ParserToken(TokenType.REFINEDLIST, "", []);
  for (let child of children) {
    if (child.type === TokenType.string) refinedListToken.children.push;
    else if (Array.isArray(child)) {
      let childToken = exec(child);
      if (childToken.TYPE === TokenType.REFINEDLIST)
        refinedListToken.push(...childToken.children);
      else if (childToken.TYPE === TokenType.STRING)
        refinedListToken.push(childToken.text);
      else {
        throw new Error(
          `Parser recieved an unexpected type from List execution ${childToken.TYPE}`
        );
      }
    } else {
      throw new Error(
        "Parser recieved template child that was not string or array of tokens. TBD catch in type checking."
      );
    }
  }
  return refinedListToken;
}

/**
 * @param {ParserToken[]} children - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function execTemplate(children = [], ctx) {
  let strToken = new ParserToken(TokenType.STRING, "");
  for (let child of children) {
    if (child.type === TokenType.string) strToken += child.text;
    else if (Array.isArray(child)) {
      let childValue = exec(child).text;
      strToken += childValue;
    } else {
      throw new Error(
        "Parser recieved template child that was not string or array of tokens. TBD catch in type checking."
      );
    }
  }
  return strToken;
}

module.exports = {
  executeCmd,
};
