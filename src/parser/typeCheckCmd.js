const { VariableContext, VariableType } = require("./paserContext");
const { TokenType, ParserToken, DECLARATIONS } = require("./tokenizeCommand");

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {VariableContext[]} variables - The name of the method.
 **/
function checkTypes(cmdTokens = [], variables = []) {
  let isVarDeclaration = cmdTokens[0].TokenType === TokenType.TYPE;
  if (isVarDeclaration) {
    checkVarDeclarationTypes(cmdTokens, variables);
  } else {
    checkNonDeclarationTypes(cmdTokens, variables);
  }
}

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {VariableContext[]} variables - The name of the method.
 **/
function checkVarDeclarationTypes(cmdTokens, variables) {
  let varTyp = cmdTokens[0].text;
  let varName = cmdTokens[1].text;
  let varCtx = new VariableContext(
    varTyp,
    varName,
    varTyp === VariableType.LIST ? [] : ""
  );
  variables.push(varCtx);
  if (cmdTokens.length < 3) return;
  let expectedType = cmdTokens[0].ParserToken;
}

/**
 * @param {ParserToken[]} expectedType - The parsed tokens in command.
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {VariableContext[]} variables - The name of the method.
 **/
function checkTypeExpression(expectedType, cmdTokens, variables) {
  //
}

/**
 * @param {ParserToken[]} cmdTokens - The parsed tokens in command.
 * @param {VariableContext[]} variables - The name of the method.
 **/
function checkNonDeclarationTypes(cmdTokens, variables) {
  //
}

module.exports = {
  checkTypes,
};
