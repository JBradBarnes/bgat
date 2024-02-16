const { VariableContext, VariableType } = require("./variableContext");
const { ParserToken, TokenType, Statics } = require("./tokenizeCommand");
const { Method, BuiltinMethods } = require("./methods");
const { ParserContext } = require("./paserContext");

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function executeCmd(cmdTokens = [], ctx) {
  let isVarDeclaration = cmdTokens[0].type === TokenType.TYPE;
  let result;
  if (isVarDeclaration) {
    result = execVarDeclaration(cmdTokens, ctx);
  } else {
    result = exec(cmdTokens, ctx);
  }

  if (result.value) {
    return Array.isArray(result.value) ? result.value.join() : result.value;
  }

  if (result.type === TokenType.VARIABLE) {
    result = execArg(result);
  }

  if (result.type === TokenType.REFINEDLIST) {
    return result.children.join();
  } else if (result.type === TokenType.STRING) {
    return result.text;
  } else if (result === TokenType.TEMPLATE) {
    execTemplate(result, ctx);
  } else {
    throw new Error(
      `Unexpected Execution Return type ${result.TYPE} on ${JSON.stringify(
        result
      )}`
    );
  }
}

/**
 * @param {ParserToken[]} cmdTokensProp - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function exec(cmdTokensProp = [], ctx) {
  let cmdTokens = [...cmdTokensProp];
  let subject = null;
  let checkFirst = () => {
    let tokenTyp = cmdTokens[0].type;
    let firstIsValue =
      tokenTyp === TokenType.STRING ||
      tokenTyp === TokenType.LIST ||
      tokenTyp === TokenType.REFINEDLIST ||
      tokenTyp === TokenType.VARIABLE;

    if (firstIsValue) {
      if (cmdTokens.length > 1 && tokenTyp !== TokenType.VARIABLE)
        throw new Error(
          `Unexpected code following litteral ${cmdTokens[0].text} ${cmdTokens
            .slice(1)
            .map((t) => t.text)
            .join()}`
        );
      return firstIsValue;
    }
  };

  while (cmdTokens[0]?.type == TokenType.TEMPLATE) {
    let template = cmdTokens.shift();
    let newToken = execTemplate(template.children, ctx);
    cmdTokens.unshift(newToken);
  }

  if (checkFirst()) {
    if (cmdTokens.length === 1)
      if (cmdTokens[0].type === TokenType.VARIABLE) {
        return execArg(cmdTokens[0], ctx);
      } else if (cmdTokens[0].type === TokenType.LIST) {
        return execList(cmdTokens[0].children, ctx);
      } else {
        return cmdTokens[0];
      }
  }

  while (cmdTokens.find((t) => t.type === TokenType.METHOD)) {
    checkFirst();
    if (!subject) subject = cmdTokens.shift();
    let methodToken = cmdTokens.shift();
    let arg;
    if (cmdTokens.length && cmdTokens[0]?.type !== TokenType.METHOD) {
      arg = cmdTokens.shift();
      arg = execArg(arg, ctx);
    }
    subject = execMethod([subject, methodToken, arg], ctx);
  }

  if (cmdTokens.length)
    throw new Error(
      `Tokens left that did not bind to a method
      line:${ctx.line}
      location:${ctx.lineLocation}
      ${ctx.commands[cmdTokens[0].line]}
      ${JSON.stringify(cmdTokens)}`
    );
  return subject;
}

/**
 * @param {ParserToken} arg - The arg token.
 * @param {ParserContext} ctx - The name of the method.
 **/
function execArg(arg, ctx) {
  switch (arg.type) {
    case TokenType.VARIABLE: {
      let variable = ctx.getVariableCtx(arg.text);
      if (!variable) throw new Error(`Undefined variable: ${arg.text}`);
      let result =
        variable.type === VariableType.LIST
          ? new ParserToken(TokenType.REFINEDLIST, arg.text, variable.value)
          : new ParserToken(TokenType.STRING, variable.value);
      result.variableToken = arg;
      result.variable = variable;
      return result;
    }
    case TokenType.STRING:
      return new ParserToken(TokenType.REFINEDLIST, arg.text, [arg.text]);
    case TokenType.TEMPLATE:
      return new ParserToken(TokenType.REFINEDLIST, arg.text, [
        execTemplate(arg.children, ctx),
      ]);
    case TokenType.LIST:
      return execList(arg.children, ctx);
    case TokenType.REFINEDLIST: {
      return arg;
    }
    default:
      throw new Error(
        `A method cannot be called with the token type ${arg.type}`
      );
  }
}

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function execVarDeclaration(cmdTokens = [], ctx) {
  let varType = cmdTokens[0].text;
  let varName = cmdTokens[1].text;
  let preExistingVar = ctx.getVariableCtx(varName, false);
  if (varType === "param" && preExistingVar) return preExistingVar;
  let newVar = new VariableContext(
    varType,
    varName,
    cmdTokens[0].type === VariableType.LIST ? [] : ""
  );
  if (cmdTokens.length > 3) {
    let resultToken = exec(cmdTokens.slice(3), ctx);
    const isList = [TokenType.LIST, TokenType.REFINEDLIST].includes(
      resultToken.type
    );
    const isStr = [TokenType.STRING].includes(resultToken.type);
    if (isList) {
      newVar.value = resultToken.children;
    } else if (isStr) {
      newVar.value = resultToken.text;
    } else {
      throw new Error(`Unexpected result token ${resultToken.type}`);
    }
  }
  ctx.variables.unshift(newVar);
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
  if (list.type !== TokenType.REFINEDLIST) {
    let listTok = execList(list.children);
    listToken = { ...listTok, text: list.text };
  }
  let subjectType = getMethodTypeFromToken(subject, ctx);
  let methodName = methodToken.text.slice(1);
  let method = getMethod(subjectType, methodName);
  let { returnType } = method;
  let newTokenTyp =
    returnType === Statics.LIST ? TokenType.REFINEDLIST : TokenType.STRING;

  let refinedArg = execArg(listToken);
  try {
    let refinedSubject =
      subject.type === TokenType.VARIABLE ? execArg(subject, ctx) : subject;
    let value = method.impl(
      {
        subject: refinedSubject,
        ...ctx,
      },
      refinedArg.children
    );

    let tokenVal = newTokenTyp === TokenType.REFINEDLIST ? text : value;

    let runVal = ctx.getRunVarCtx();
    runVal.value = tokenVal;
    runVal.type = newTokenTyp;

    let newToken = new ParserToken(
      newTokenTyp,
      tokenVal,
      newTokenTyp === TokenType.REFINEDLIST ? value : undefined
    );

    return newToken;
  } catch (e) {
    throw new Error(
      `Issue in method execution ${subject.text}.${methodName}
      line:${methodToken.line}
      location:${methodToken.lineLocation}
      ${ctx.commands[methodToken.line]}
      msg: ${e.message}`
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
  if (!meth)
    throw new Error(`Undefined Method ${methodName} on ${subjectType}`);
  return meth;
}

/**
 * @param {ParserToken} token - The parsed tokens in command.
 * @param {ParserContext} ctx - The name of the method.
 **/
function getMethodTypeFromToken(token, ctx) {
  switch (token.type) {
    case TokenType.VARIABLE: {
      let variable = ctx.getVariableCtx(token.text);
      if (!variable) throw new Error(`Undefined variable ${token.text}`);
      return variable.type === VariableType.LIST
        ? Statics.LIST
        : Statics.STRING;
    }
    case TokenType.STATIC: {
      return token.text;
    }
    case TokenType.STRING: {
      return Statics.STRING;
    }
    case TokenType.REFINEDLIST: {
      return Statics.LIST;
    }
    default: {
      throw new Error(
        `${token.text}, type ${token.type}  is not a static or variable and cannot be used as the subject of a method`
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
    if (child.type === TokenType.STRING)
      refinedListToken.children.push(child.text);
    else if (child.type === TokenType.REFINEDLIST)
      refinedListToken.children.push(child.children);
    else if (child.type === TokenType.TEMPLATE)
      execTemplate(child.children, ctx);
    else if (Array.isArray(child)) {
      let childToken = exec(child, ctx);
      if (childToken.type === TokenType.REFINEDLIST)
        refinedListToken.children.push(...childToken.children);
      else if (childToken.type === TokenType.STRING)
        refinedListToken.children.push(childToken.text);
      else if (childToken.type === TokenType.VARIABLE) {
        let token = execArg(childToken, ctx);
        let values =
          token.type === TokenType.STRING ? [token.text] : token.children;
        refinedListToken.children.push(...values);
      } else {
        throw new Error(
          `Parser recieved an unexpected type from List execution ${childToken.type}`
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
    if (typeof child === "string") strToken.text += child;
    else if (Array.isArray(child)) {
      let childValue = exec(child, ctx).text;
      strToken.text += childValue;
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
